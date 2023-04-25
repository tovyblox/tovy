// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, { user }from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { withPermissionCheck } from '@/utils/permissionsManager'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import { getRobloxUsername, getRobloxThumbnail, getRobloxDisplayName, getRobloxUserId } from "@/utils/roblox";
import * as noblox from 'noblox.js'
type Data = {
	success: boolean
	error?: string
	user?: any
}

export default withPermissionCheck(handler, 'admin');

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
	const userid = await getRobloxUserId(req.body.username).catch(() => null) as number | undefined;
	if (!userid) return res.status(400).json({ success: false, error: 'Invalid username' });

	const role = await prisma.role.findFirst({
		where: {
			isOwnerRole: false,
		}
	});
	const u = await prisma.user.findFirst({
		where: {
			userid: userid,
			roles: {
				some: {
					workspaceGroupId: parseInt(req.query.id as string)
				}
			}
		},
	});
	if (u) return res.status(400).json({ success: false, error: 'User already exists' });
	if (!role) return res.status(404).json({ success: false, error: 'Role not found' });

	const user = await prisma.user.upsert({
		where: {
			userid: userid
		},
		update: {
			username: await getUsername(userid),
			roles: {
				connect: {
					id: role.id
				}
			}
		},
		create: {
			userid: userid,
			username: await getUsername(userid),

			roles: {
				connect: {
					id: role.id
				}
			}
		},
	});
	const newuser = {
		roles: [
			role
		],
		userid: Number(user.userid),
		username: req.body.username,
		displayName: await getDisplayName(userid),
		thumbnail: await getThumbnail(userid)
	}

	res.status(200).json({ success: true, user: newuser })
}
