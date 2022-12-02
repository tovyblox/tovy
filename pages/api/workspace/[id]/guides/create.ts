// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, { SessionType, document } from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { withPermissionCheck } from '@/utils/permissionsManager'

import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
type Data = {
	success: boolean
	error?: string
	session?: SessionType
	document?: document
}

export default withPermissionCheck(handler, 'manage_docs');

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
	const { name, content, roles } = req.body;
	if (!name || !content || !roles) return res.status(400).json({ success: false, error: 'Missing required fields' });
	const { id } = req.query;
	if (!id) return res.status(400).json({ success: false, error: 'Missing required fields' });
	
	const document = await prisma.document.create({
		data: {
			workspaceGroupId: parseInt(id as string),
			name,
			ownerId: BigInt(req.session.userid),
			content,
			roles: {
				connect: [
					...roles.map((role: string) => ({ id: role }))
				]
			}
		}
	});
	
	res.status(200).json({ success: true, document: JSON.parse(JSON.stringify(document, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) });
}
