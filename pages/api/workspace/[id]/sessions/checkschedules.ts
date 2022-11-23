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
	const { key } = req.headers;
	//if (!key) return res.status(401).json({ success: false, error: 'No key provided' })
	const registryconfig = await prisma.instanceConfig.findFirst({
		where: {
			key: 'registry'
		}
	});
	if (!registryconfig?.value) return res.status(500).json({ success: false, error: 'No registry config found' })
	//const regkey = JSON.parse((registryconfig.value as string)).key;
	//if (key !== regkey) return res.status(401).json({ success: false, error: 'Invalid key' });
	//find all schedules that have past times today
	console.log(new Date().getMinutes(), new Date().getHours(), new Date().getDay())
	const schedules = await prisma.schedule.findMany({
		where: {
			Days: {
				has: new Date().toLocaleDateString('en-us', { weekday: 'short' })
			}, 
			Hour: {
				lte: new Date().getHours()
			},
			Minute: {
				lte: new Date().getMinutes()
			}
		}
	});

	for (const schedule of schedules) {
		const date = new Date();
		date.setHours(schedule.Hour);
		date.setMinutes(schedule.Minute);

		const session = await prisma.session.findFirst({
			where: {
				scheduleId: schedule.id,
				date: date
			}
		});
		if (!session?.ownerId) continue;
		await prisma.session.update({
			where: {
				id: session.id
			},
			data: {
				startedAt: new Date()
			}
		});
	}
	

	res.status(200).json({ success: true })
}
