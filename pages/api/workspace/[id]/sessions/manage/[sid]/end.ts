// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/database';
import { deleteWebhook, } from '@/utils/sessionWebhook';
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
	const user = await prisma.user.findUnique({
		where: {
			userid: BigInt(req.session.userid)
		},
		include: {
			roles: {
				where: {
					workspaceGroupId: parseInt(req.query.id as string)
				}
			}
		}
	});

	const session = await prisma.session.findFirst({
		where: {
			id: (sid as string),
			ownerId: req.session.userid
		},
		include: {
			sessionType: {
				include: {
					hostingRoles: true
				}
			}
		}
	});
	if (!session) return res.status(400).json({ success: false, error: 'Invalid session' });
	if (!session?.sessionType.hostingRoles.find(r => r.id === user?.roles[0].id) && !user?.roles[0].isOwnerRole && !user?.roles[0].permissions.includes('admin')) return res.status(403).json({ success: false, error: 'You do not have permission to claim this session' });

	await prisma.session.update({
		where: {
			id: session.id
		},
		data: {
			ended: new Date()
		}
	});
	if (session.sessionType.webhookEnabled) {
		await deleteWebhook(session)
	}
	res.status(200).json({ success: true });
}
