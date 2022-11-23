// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma, { schedule } from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
type Data = {
	success: boolean
	error?: string
	session?: schedule
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
	const { id, sid } = req.query;
	if (!id || !sid) return res.status(400).json({ success: false, error: 'Missing required fields' });
	const { date } = req.body;
	if (!date) return res.status(400).json({ success: false, error: 'Missing required fields' });
	const day = new Date(date);

	const schedule = await prisma.schedule.findFirst({
		where: {
			id: (sid as string),
			Days: {
				has: day.toLocaleDateString('en-us', { weekday: 'short' })
			}
		}
	});
	if (!schedule) return res.status(400).json({ success: false, error: 'Invalid schedule' });
	const dateTime = new Date(`${day.toLocaleDateString('en-us')} ${schedule.Hour}:${schedule.Minute}`);

	const findSession = await prisma.session.findFirst({
		where: {
			date: dateTime,
			sessionTypeId: schedule.sessionTypeId
		}
	});
	if (findSession) {
		findSession.ownerId = BigInt(req.session.userid);
		const schedulewithsession = await prisma.schedule.update({
			where: {
			   id: schedule.id
			},
			data: {
			   sessions: {
				   update: {
						where: {
							id: findSession.id
						},
						data: {
							ownerId: req.session.userid
						}
				   }
			   }
			}, 
		   include: {
			   sessionType: true,
			   sessions: {
				   include: {
					   owner: true
				   }
			   }
		   }	
	   });

		return res.status(200).json({ success: true, session: schedulewithsession });
	}

	const schedulewithsession = await prisma.schedule.update({
		where: {
			id: schedule.id
		},
		data: {
			sessions: {
				create: {
					date: dateTime,
					sessionTypeId: schedule.sessionTypeId,
					ownerId: req.session.userid,
				}
			}
		},
		include: {
			sessionType: true,
			sessions: {
				include: {
					owner: true
				}
			}
		}

	});



	res.status(200).json({ success: true, session: schedulewithsession })
}
