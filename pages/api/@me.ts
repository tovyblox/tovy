// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '../../utils/configEngine'
import prisma from '../../utils/database';
import { withSessionRoute } from '../../lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '../../utils/userinfoEngine'
import * as noblox from 'noblox.js'

type User = {
	userId: number
	username: string
	displayname: string
	thumbnail: string
}

type Data = {
	success: boolean
	error?: string
	user?: User
	workspaces?: { 
		groupId: number
		groupthumbnail: string
		groupname: string
	}[]
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (!await prisma.workspace.count()) return res.status(400).json({ success: false, error: 'Workspace not setup' })
	if (!req.session.userid) return res.status(401).json({ success: false, error: 'Not logged in' });
	const user: User = {
		userId: req.session.userid,
		username: await getUsername(req.session.userid),
		displayname: await getDisplayName(req.session.userid),
		thumbnail: await getThumbnail(req.session.userid)
	}
	const tovyuser = await prisma.user.findUnique({
		where: {
			userid: req.session.userid
		},
		include: {
			roles: true
		}
	})
	let roles: any[] = [];
	if (tovyuser?.roles.length) {
		for (const role of tovyuser.roles) {
			roles.push({
				groupId: role.workspaceGroupId,
				groupThumbnail: await noblox.getLogo(role.workspaceGroupId),
				groupName: await noblox.getGroup(role.workspaceGroupId).then(group => group.name),
			})
		}
	}
	console.log(tovyuser)
	res.status(200).json({ success: true, user, workspaces: roles })
}