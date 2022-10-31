// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, { SessionType } from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
type Data = {
	success: boolean
	error?: string
	session?: SessionType
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
	const { name, schedule, permissions } = req.body;
	if (!name || !schedule || !permissions) return res.status(400).json({ success: false, error: 'Missing required fields' });
	const { days, time, allowUnscheduled } = schedule;
	if (schedule.enebaled && (!days || !time || !allowUnscheduled)) return res.status(400).json({ success: false, error: 'Missing required fields' });
	if (schedule.enabled) {
		console.log(time.split(':')[0])
		const session = await prisma.sessionType.create({
			data: {
				workspaceGroupId: parseInt(req.query.id as string),
				name,
				gameId: (parseInt(req.body.gameId as string) || null),
				allowUnscheduled: schedule.allowUnscheduled,
				hostingRoles: {
					connect: [
						...permissions.map((role: string) => ({ id: role }))
					]
				},
				schedule: {
					create: [
						{ Days: days, Hour: parseInt(time.split(':')[0]), Minute: parseInt(time.split(':')[1]) },
					]
				}
				
			}
		});
		
		return res.status(200).json({ success: true, session })

	}
	
	const session = await prisma.sessionType.create({
		data: {
			workspaceGroupId: parseInt(req.query.id as string),
			name,
			gameId: (parseInt(req.body.gameId as string) || null),
			allowUnscheduled: schedule.allowUnscheduled,
			hostingRoles: {
				connect: [
					...permissions.map((role: string) => ({ id: role }))
				]
			},
			
		}
	});
	
	res.status(200).json({ success: true, session })
}
