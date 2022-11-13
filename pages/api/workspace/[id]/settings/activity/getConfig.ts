// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, { role } from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
import { get } from 'react-hook-form';
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
type Data = {
	success: boolean
	error?: string
	roles?: any
	currentRole?: any
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
	const workspace = await prisma.workspace.findFirst({
		where: {
			groupId: parseInt(req.query.id as string),
		}
	});
	if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found' });

	const roles = await noblox.getRoles(workspace.groupId);
	const activityconfig = await getConfig('activity', parseInt(req.query.id as string));

	res.status(200).send({
		roles,
		currentRole: activityconfig?.role,
		success: true,
	});
}
