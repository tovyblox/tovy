// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, { role } from '@/utils/database';
import { withPermissionCheck } from '@/utils/permissionsManager'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
import { get } from 'react-hook-form';
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
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
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
	let activityconfig = await getConfig('activity', parseInt(req.query.id as string));
	if (!activityconfig?.key) {
		activityconfig = {
			key: crypto.randomBytes(16).toString('hex')
		}
		setConfig('activity', activityconfig, parseInt(req.query.id as string));
	};


	let xml_string = fs.readFileSync(path.join('Tovy2-activity-alpha.rbxmx'), "utf8");
	res.setHeader('Content-Disposition', 'attachment; filename=Tovy2-activity-alpha.rbxmx');
	const protocol = req.headers['x-forwarded-proto'] || req.headers.referer?.split('://')[0] || 'http';
	console.log(protocol);
	let xx = xml_string.replace('<key>', activityconfig.key).replace('<url>', `${protocol}//${req.headers.host}/api/ranking`);


	//send file and set content type
	res.setHeader('Content-Type', 'application/rbxmx');
	res.status(200).send(xx as any);
}
