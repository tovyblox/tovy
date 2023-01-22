//logout of tovy

import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from '@/lib/withSession'
import { checkSpecificUser } from "@/utils/permissionsManager";

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (!req.session.userid) return res.status(401).json({ success: false, error: 'Not logged in' })
	await checkSpecificUser(req.session.userid)
	res.status(200).json({ success: true })
}
