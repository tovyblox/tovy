// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
import { withPermissionCheck } from '@/utils/permissionsManager'

import { inactivityNotice } from '@prisma/client';
type Data = {
	success: boolean
	error?: string
	notices?: inactivityNotice[]
};

export default withPermissionCheck(handler, 'manage_activity');


export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (!req.session.userid) return res.status(401).json({ success: false, error: 'Not logged in' });

	const notices = await prisma.inactivityNotice.findMany({
		where: {
			workspaceGroupId: parseInt(req.query.id as string),
			approved: false
		}
	});

	return res.status(200).json({ success: true, notices });
}
