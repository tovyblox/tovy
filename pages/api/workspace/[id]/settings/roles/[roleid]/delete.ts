// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma from '@/utils/database';
import { withPermissionCheck } from '@/utils/permissionsManager'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
import roles from '..';
type Data = {
	success: boolean
	error?: string
}

export default withPermissionCheck(handler, 'admin');

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
	if (!req.query.roleid) return res.status(400).json({ success: false, error: 'Role ID not provided' });
	const role = await prisma.role.findMany({
		where: {
			workspaceGroupId: parseInt(req.query.id as string)
		},
		include: {
			members: true
		}
	});
	const oldrole = role.find(r => r.id === req.query.roleid);
	if (!oldrole) return res.status(404).json({ success: false, error: 'Role not found' });
	if (!(role.length - 1)) return res.status(404).json({ success: false, error: 'You cant delete a role with no fallback ' });
	const newrole = role[0];

	for (const member of oldrole.members) {
		await prisma.user.update({
			where: {
				userid: member.userid
			},
			data: {
				roles: {
					connect: {
						id: newrole.id
					},
					disconnect: {
						id: newrole.id
					}
				}
			}
		});
	};

	await prisma.role.delete({
		where: {
			id: (req.query.roleid as string)
		}
	});

	res.status(200).json({ success: true })
}
