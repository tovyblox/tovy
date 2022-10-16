// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, { role } from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'

type Data = {
	success: boolean
	error?: string
	workspace?: {
		groupId: number
		groupThumbnail: string
		groupName: string,
		roles: role[]
		groupTheme: string
	}
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (!await prisma.workspace.count()) return res.status(400).json({ success: false, error: 'Workspace not setup' })
	if (!req.session.userid) return res.status(401).json({ success: false, error: 'Not logged in' });
	const { id } = req.query
	
	if (!id) return res.status(400).json({ success: false, error: 'No id provided' })
	if (isNaN(Number(id))) return res.status(400).json({ success: false, error: 'Invalid id provided' })
	
	let workspace = await prisma.workspace.findUnique({
		where: {
			groupId: parseInt((id as string))
		}
	})

	if (!workspace) return res.status(400).json({ success: false, error: 'Workspace not found' })
	const themeconfig = await getConfig('customization', workspace.groupId)
	const roles = await prisma.role.findMany({
		where: {
			workspaceGroupId: workspace.groupId,
			isOwnerRole: false
		}
	})
	let groupinfo = await noblox.getGroup(workspace.groupId)
	
	res.status(200).json({ success: true, workspace: {
		groupId: workspace.groupId,
		groupThumbnail: await noblox.getLogo(workspace.groupId),
		groupName: groupinfo.name,
		groupTheme: themeconfig,
		roles: roles

	} })
}
