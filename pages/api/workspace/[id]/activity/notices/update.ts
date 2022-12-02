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
};

export default withPermissionCheck(handler, 'manage_activity');


export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (!req.session.userid) return res.status(401).json({ success: false, error: 'Not logged in' });

	const status = req.body.status;
	if (status !== 'approve' && status !== 'deny') return res.status(400).json({ success: false, error: 'Invalid status' });
	const id = req.body.id
	if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });
	const notice = await prisma.inactivityNotice.findUnique({
		where: {
			id
		}
	});
	if (!notice) return res.status(404).json({ success: false, error: 'Notice not found' });
	if (notice.approved) return res.status(400).json({ success: false, error: 'Notice already approved' });
	await prisma.inactivityNotice.update({
		where: {
			id
		},
		data: {
			approved: status === 'approve',
			reviewed: true
		}
	});


	return res.status(200).json({ success: true });
}
