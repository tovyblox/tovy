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
	if (req.method !== 'DELETE') return res.status(405).json({ success: false, error: 'Method not allowed' })
	const { id, sid } = req.query;
	if (!id || !sid) return res.status(400).json({ success: false, error: 'Missing required fields' });
	const session = await prisma.session.findFirst({
		where: {
			id: (sid as string),
			ownerId: req.session.userid
		}
	});
	if (!session) return res.status(400).json({ success: false, error: 'Invalid session' });
	await prisma.session.update({
		where: {
			id: session.id
		},
		data: {
			ended: new Date()
		}
	});
	res.status(200).json({ success: true });
}
