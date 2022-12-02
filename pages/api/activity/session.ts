// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { red } from 'tailwindcss/colors';
import * as noblox from 'noblox.js'
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
	if (!config) return res.status(401).json({ success: false, error: "Unauthorized" })
	if (!req.body.userid) return res.status(400).json({ success: false, error: "Missing user ID from request body" })
	if (typeof req.body.userid !== "number") return res.status(400).json({ success: false, error: "User ID not a number" });
	const value = JSON.parse(JSON.stringify(config.value));
	if (value.role) {
		const userank = await noblox.getRankInGroup(config.workspaceGroupId, req.session.userid);
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
			username: await noblox.getUsernameFromId(req.body.userid)
		},
		create: {
			userid: BigInt(req.body.userid),
			username: await noblox.getUsernameFromId(req.body.userid)
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
		console.log(session.length)

		if(session.length < 1) return res.status(400).json({ success: false, error: "Session not found" })

		try {
			await prisma.activitySession.update({
				where: {
					id: session[0].id
				},
				data: {
					endTime: new Date(),
					active: false
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
