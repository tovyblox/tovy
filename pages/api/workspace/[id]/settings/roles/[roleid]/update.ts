// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
type Data = {
	success: boolean
	error?: string
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
	const role = await prisma.role.findUnique({
		where: {
			id: (req.query.roleid as string)
		}
	});
	if (!role) return res.status(404).json({ success: false, error: 'Role not found' });
	await prisma.role.update({
		where: {
			id: (req.query.roleid as string)
		},
		data: {
			name: req.body.name,
			permissions: req.body.permissions
		}
	});

	res.status(200).json({ success: true })
}
