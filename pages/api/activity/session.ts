// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
type Data = {
	success: boolean
	error?: string
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (req.headers.authorization !== "12345") return res.status(401).json({ success: false, error: "Unauthorized" })
	if (!req.body.userid) return res.status(400).json({ success: false, error: "Missing user ID from request body" })
	if (typeof req.body.userid !== "number") return res.status(400).json({ success: false, error: "User ID not a number" })

	if (req.query.type == "create"){
		const session = await prisma.activitySession.findMany({
			where: {
				userId: req.body.userid,
				active: true
			}
		})
	
		if(session.length > 0) return res.status(400).json({ success: false, error: "Session already initialized" })
		try {
			await prisma.activitySession.create({
				data: {
					userId: req.body.userid,
					active: true,
					startTime: new Date()
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
				userId: req.body.userid,
				active: true
			}
		})

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
