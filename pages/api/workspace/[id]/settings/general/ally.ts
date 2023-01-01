// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, {role} from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { withPermissionCheck } from '@/utils/permissionsManager'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
import { get } from 'react-hook-form';
type Data = {
	success: boolean
	error?: string
	count?: number
}

export default withPermissionCheck(handler, 'admin');

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method === 'GET') {
		const config = await getConfig('allies', parseInt(req.query.id as string));
		return res.status(200).json({ success: true, count: config.count })
	}
	if (req.method !== 'PATCH') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (!req.body.count) return res.status(400).json({ success: false, error: 'No count provided' })
	setConfig('allies', {
		count: req.body.count
	}, parseInt(req.query.id as string));
	
	res.status(200).json({ success: true })
}
