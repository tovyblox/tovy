// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, { inactivityNotice } from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { withPermissionCheck } from '@/utils/permissionsManager'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
type Data = {
	success: boolean
	error?: string
	quota?: any
}

export default withPermissionCheck(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (!req.session.userid) return res.status(401).json({ success: false, error: 'Not logged in' });
	const { name, type, value, roles } = req.body;
	if (!name || !type || !value || !roles) return res.status(400).json({ success: false, error: "Missing data" });

	try {
		const quota = await prisma.quota.create({
			data: {
				name,
				type,
				value,
				workspaceGroupId: parseInt(req.query.id as string),
				assignedRoles: {
					connect: roles.map((role: number) => ({ id: role }))
				}
			}
		});

		return res.status(200).json({ success: true, quota: JSON.parse(JSON.stringify(quota, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, error: "Something went wrong" });
	}
}
