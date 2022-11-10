// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, {role} from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
import { get } from 'react-hook-form';
type Data = {
	success: boolean
	error?: string
	color?: string
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'PATCH' && req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (req.method === 'GET') {
		const color = await getConfig('color', parseInt(req.query.id as string))
		return res.status(200).json({ success: true, color })
	}
	setConfig('customization', {
		color: req.body.color
	}, parseInt(req.query.id as string));
	
	res.status(200).json({ success: true })
}
