// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/database';
import { withPermissionCheck } from '@/utils/permissionsManager'
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
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
	username: string;
	ms: number;
}

export default withPermissionCheck(handler);

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
	const inactiveSession = await prisma.inactivityNotice.findMany({
		where: {
			endTime: {
				gt: new Date()
			},
			startTime: {
				lt: new Date()
			},
			workspaceGroupId: parseInt(req.query.id as string)
		},
		select: {
			userId: true,
			reason: true,
			startTime: true,
			endTime: true
		}
	})

	var activeUsers: {
		userId: number, username: string
	}[] = [];
	var inactiveUsers: {
		userId: number, username: string, reason: string, from: Date, to: Date
	}[] = [];
	
	for (const user of activeSession) {
		activeUsers.push({
			userId: Number(user.userId),
			username: await getUsername(user.userId)
		})
	}
	for (const session of inactiveSession) {
		inactiveUsers.push({
			userId: Number(session.userId),
			reason: session.reason,
			from: session.startTime,
			to: session.endTime!,
			username: await getUsername(session.userId),
		})
	}


	activeUsers = activeUsers.filter((v, i, a) => a.indexOf(v) == i);
	inactiveUsers = inactiveUsers.filter((v, i, a) => a.indexOf(v) == i);
	
	inactiveUsers = inactiveUsers.filter((x) => {
		if (activeUsers.find(y => x == y)) return false;
		return true;
	});

	const combinedMinutes: CombinedObj[] = [];
	sessions.forEach((session) => {
		if (!session.endTime) return;
		const found = combinedMinutes.find(x => x.userId == Number(session.userId));
		if (found){
			found.ms.push((session.endTime.getTime() - session.startTime.getTime()) - (session.idleTime ? Number(session.idleTime) * 60000 : 0))
		} else {
			combinedMinutes.push({ userId: Number(session.userId), ms: [session.endTime.getTime() - session.startTime.getTime() - (session.idleTime ? Number(session.idleTime) * 60000 : 0)] });
		}
	});

	const topStaff: TopStaff[] = [];
	for (const min of combinedMinutes) {
		const minSum = min.ms.reduce((partial, a) => partial + a, 0);
		topStaff.push({
			userId: min.userId,
			username: await getUsername(min.userId),
			ms: minSum
		});
	}

	return res.status(200).json({ success: true, message: { activeUsers, inactiveUsers, topStaff } });
}
