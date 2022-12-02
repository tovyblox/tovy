// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, {role} from '@/utils/database';
import { withPermissionCheck } from '@/utils/permissionsManager'

import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
import { get } from 'react-hook-form';
type Data = {
	success: boolean
	error?: string
	color?: string
}

export default withPermissionCheck(handler, 'admin');

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'PATCH') return res.status(405).json({ success: false, error: 'Method not allowed' })
	setConfig('guides', {
		enabled: req.body.enabled
	}, parseInt(req.query.id as string));
	
	res.status(200).json({ success: true })
}
