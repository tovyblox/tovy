import prisma from "./database";
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import { withSessionRoute } from '@/lib/withSession'

type MiddlewareData = {
	handler: NextApiHandler
	next: any
	permissions: string
}

export function withPermissionCheck(
	handler: NextApiHandler,
	permission?: string
) {
	return withSessionRoute(async (req: NextApiRequest, res: NextApiResponse) => {
		const uid = req.session.userid;
		if (!uid) return res.status(401).json({ success: false, error: 'Unauthorized' });
		if (!req.query.id) return res.status(400).json({ success: false, error: 'Missing required fields' });
		const workspaceId = parseInt(req.query.id as string);
		

		const user = await prisma.user.findFirst({
			where: {
				userid: uid
			},
			include: {
				roles: true
			}
		});
		if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
		const userrole = user.roles.find(role => role.workspaceGroupId === workspaceId);
		if (!userrole) return res.status(401).json({ success: false, error: 'Unauthorized' });
		if (userrole.isOwnerRole) return handler(req, res);
		if (!permission) return handler(req, res);
		if (userrole.permissions.includes(permission)) return handler(req, res);
		return res.status(401).json({ success: false, error: 'Unauthorized' });
	})
}
