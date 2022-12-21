// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma, { SessionType } from '@/utils/database';
import { withPermissionCheck } from '@/utils/permissionsManager'
type Data = {
	success: boolean
	error?: string
	session?: SessionType
}

export default withPermissionCheck(handler, 'manage_sessions');

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
	const { name, schedule, permissions, webhook, slots, statues } = req.body;
	if (!name || !schedule || !permissions) return res.status(400).json({ success: false, error: 'Missing required fields' });
	const { days, time, allowUnscheduled } = schedule;
	if (schedule.enebaled && (!days || !time || !allowUnscheduled)) return res.status(400).json({ success: false, error: 'Missing required fields' });
	if (schedule.enabled) {
		const session = await prisma.sessionType.create({
			data: {
				workspaceGroupId: parseInt(req.query.id as string),
				name,
				gameId: (BigInt(req.body.gameId as string) || null),
				allowUnscheduled: schedule.allowUnscheduled,
				statues: statues || [],
				slots: slots || [],
				webhookEnabled: webhook?.enabled || false,
				webhookUrl: webhook?.url,
				webhookPing: webhook?.ping,
				webhookBody: webhook?.body,
				webhookTitle: webhook?.title,
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
		
		return res.status(200).json({ success: true, session: JSON.parse(JSON.stringify(session, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) })

	}
	
	const session = await prisma.sessionType.create({
		data: {
			workspaceGroupId: parseInt(req.query.id as string),
			name,
			gameId: (parseInt(req.body.gameId as string) || null),
			allowUnscheduled: schedule.allowUnscheduled,
			webhookEnabled: webhook?.enabled || false,
			webhookUrl: webhook?.url,
			webhookPing: webhook?.ping,
			slots: slots || [],
			statues: statues || [],
			webhookBody: webhook?.body,
			webhookTitle: webhook?.title,
			hostingRoles: {
				connect: [
					...permissions.map((role: string) => ({ id: role }))
				]
			},
			
		}
	});
	
	res.status(200).json({ success: true, session: JSON.parse(JSON.stringify(session, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) })
}
