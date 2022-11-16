// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/database';
import { withPermissionCheck } from '@/utils/permissionsManager'
import { withSessionRoute } from '@/lib/withSession'
type Data = {
	success: boolean
	message?: object;
	error?: string
}
type CombinedObj = {
	userId: number;
	ms: number[];
}
type TopStaff = {
	userId: number;
	ms: number;
}

export default withPermissionCheck(handler, 'view_entire_groups_activity');

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
	if (!req.session.userid) return res.status(401).json({ success: false, error: 'Not logged in' });

	const sessions = await prisma.activitySession.findMany({
		where: {
			workspaceGroupId: parseInt(req.query.id as string)
		}
	});
	
	const activeSession = await prisma.activitySession.findMany({
		where: {
			active: true,
			workspaceGroupId: parseInt(req.query.id as string)
		},
		select: {
			userId: true
		}
	})
	const inactiveSession = await prisma.activitySession.findMany({
		where: {
			active: false,
			workspaceGroupId: parseInt(req.query.id as string)
		},
		select: {
			userId: true
		}
	})

	var activeUsers: number[] = [];
	var inactiveUsers: number[] = [];
	
	activeSession.forEach(session => activeUsers.push(session.userId));
	inactiveSession.forEach(session => inactiveUsers.push(session.userId));

	activeUsers = activeUsers.filter((v, i, a) => a.indexOf(v) == i);
	inactiveUsers = inactiveUsers.filter((v, i, a) => a.indexOf(v) == i);
	
	inactiveUsers = inactiveUsers.filter((x) => {
		if (activeUsers.find(y => x == y)) return false;
		return true;
	});

	const combinedMinutes: CombinedObj[] = [];
	sessions.forEach((session) => {
		if (!session.endTime) return;
		const found = combinedMinutes.find(x => x.userId == session.userId);
		if (found){
			found.ms.push(session.endTime.getTime() - session.startTime.getTime())
		} else {
			combinedMinutes.push({ userId: session.userId, ms: [session.endTime.getTime() - session.startTime.getTime()] });
		}
	});

	const topStaff: TopStaff[] = [];
	combinedMinutes.forEach((min) => {
		const minSum = min.ms.reduce((partial, a) => partial + a, 0);
		topStaff.push({
			userId: min.userId,
			ms: minSum
		});
	});

	return res.status(200).json({ success: true, message: { activeUsers, inactiveUsers, topStaff } });
}
