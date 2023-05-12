//logout of tovy

import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import { getRobloxUsername, getRobloxThumbnail, getRobloxDisplayName, getRobloxUserId } from "@/utils/roblox";
import bcrypt from 'bcrypt'
import * as noblox from 'noblox.js'
import prisma from '@/utils/database';
import axios from "axios";

export default withSessionRoute(handler);

type User = {
	userId: number
	username: string
	displayname: string
	thumbnail: string
}

type response = {
	success: boolean
	error?: string
	user?: User
	workspaces?: {
		groupId: number
		groupthumbnail: string
		groupname: string
	}[]
}

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<response>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
	const id = await getRobloxUserId(req.body.username, req.headers.origin).catch(e => null) as number | undefined;
	if (!id) return res.status(404).json({ success: false, error: 'Please enter a valid username' })
	const user = await prisma.user.findUnique({
		where: {
			userid: id
		},
		select: {
			info: true,
			roles: true,
		}
	})
	if (!user?.info?.passwordhash) return res.status(401).json({ success: false, error: 'Invalid username or password' })
	const valid = await bcrypt.compare(req.body.password, user.info?.passwordhash)
	if (!valid) return res.status(401).json({ success: false, error: 'Invalid username or password' })
	req.session.userid = id
	await req.session?.save()


	const tovyuser: User = {
		userId: req.session.userid,
		username: await getUsername(req.session.userid),
		displayname: await getDisplayName(req.session.userid),
		thumbnail: await getThumbnail(req.session.userid)
	}
	let roles: any[] = [];
	if (user?.roles.length) {
		for (const role of user.roles) {
			roles.push({
				groupId: role.workspaceGroupId,
				groupThumbnail: await noblox.getLogo(role.workspaceGroupId),
				groupName: await noblox.getGroup(role.workspaceGroupId).then(group => group.name),
			})
		}
	}

	res.status(200).json({ success: true, user: tovyuser, workspaces: roles })
}
