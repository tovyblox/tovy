// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
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
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (!req.session.userid) return res.status(401).json({ success: false, error: 'Not logged in' });
	if (!req.body.userId || !req.body.startTime || !req.body.reason) return res.status(400).json({ success: false, error: "Missing data" });
	if (typeof req.body.userId !== "number" || typeof req.body.startTime !== "number") return res.status(400).json({ success: false, error: "Invalid type(s)" });

	try {
		await prisma.inactivityNotice.create({
			data: {
				userId: req.body.userId,
				startTime: new Date(req.body.startTime),
				reason: req.body.reason,
				workspaceGroupId: parseInt(req.query.id as string)
			}
		});

		return res.status(200).json({ success: true });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, error: "Something went wrong" });
	}
}
