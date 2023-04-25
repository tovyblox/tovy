// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { red } from 'tailwindcss/colors';
import { getThumbnail } from '@/utils/userinfoEngine';
import * as noblox from 'noblox.js'
import { checkSpecificUser } from '@/utils/permissionsManager';
import { getRobloxUsername, getRobloxThumbnail, getRobloxDisplayName, getRobloxUserId } from "@/utils/roblox";
type Data = {
	success: boolean
	error?: string
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
	if (!req.headers.authorization) return res.status(400).json({ success: false, error: "Authorization key missing" })
	const config = await prisma.config.findFirst({
		where: {
			value: {
				path: ["key"],
				equals: req.headers.authorization
			}
		}
	})
	console.log(config)

	if (!config) return res.status(401).json({ success: false, error: "Unauthorized" })
	if (!req.body.userid) return res.status(400).json({ success: false, error: "Missing user ID from request body" })
	if (typeof req.body.userid !== "number") return res.status(400).json({ success: false, error: "User ID not a number" });
	console.log(`${req.body.userid} is creating a session`)
	const value = JSON.parse(JSON.stringify(config.value));
	const userank = await noblox.getRankInGroup(config.workspaceGroupId, req.body.userid);
	await checkSpecificUser(req.body.userid)
	if (value.role) {
		//check if the user is above value.role
		
		if (userank <= value.role) {
			res.status(200).json({ success: true, error: "Did not create session as user is not the right rank" });
			console.log(`${req.body.userid} is not the right rank to create a session`)
			return;
		}
	};

	await prisma.user.upsert({
		where: {
			userid: BigInt(req.body.userid)
		},
		update: {
			username: await getRobloxUsername(req.body.userid),
			picture: await getThumbnail(req.body.userid)
		},
		create: {
			userid: BigInt(req.body.userid),
			username: await getRobloxUsername(req.body.userid),
			picture: await getThumbnail(req.body.userid)
		}
	})

	if (req.query.type == "create") {
		const session = await prisma.activitySession.findMany({
			where: {
				userId: BigInt(req.body.userid),
				active: true,
				workspaceGroupId: config.workspaceGroupId
			}
		})
	
		if(session.length > 0) return res.status(400).json({ success: false, error: "Session already initialized" })
		try {
			await prisma.activitySession.create({
				data: {
					userId: req.body.userid,
					active: true,
					startTime: new Date(),
					universeId: req.body.placeid ? BigInt(req.body.placeid) : null,
					workspaceGroupId: config.workspaceGroupId
				}
			});
		
			return res.status(200).json({ success: true })
		} catch (error) {
			console.error(error)
			return res.status(500).json({ success: false, error: "Unexpected error, check console" })
		}
	} else if (req.query.type == "end"){
		const session = await prisma.activitySession.findMany({
			where: {
				userId: BigInt(req.body.userid),
				active: true,
				workspaceGroupId: config.workspaceGroupId
			}
		})

		if(session.length < 1) return res.status(400).json({ success: false, error: "Session not found" })
		console.log(req.body.idleTime)

		try {
			await prisma.activitySession.update({
				where: {
					id: session[0].id
				},
				data: {
					endTime: new Date(),
					active: false,
					idleTime: req.body.idleTime  ? Number(req.body.idleTime) : 0,
					messages: req.body.messages ? Number(req.body.messages) : 0,
				}
			})
		
			return res.status(200).json({ success: true })
		} catch (error) {
			console.error(error)
			return res.status(500).json({ success: false, error: "Unexpected error, check console" })
		}
	} else {
		return res.status(200).json({ success: false, error: "Missing query (create, end)" });
	}
}
