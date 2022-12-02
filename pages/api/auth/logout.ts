//logout of tovy

import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from '@/lib/withSession'

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
	req.session.destroy();
	res.status(200).json({ success: true })
}
