// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import bcrypt from 'bcrypt'
import * as noblox from 'noblox.js'
import { getRobloxThumbnail } from '@/utils/roblox';
type Data = {
	success: boolean
	error?: string
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
	const verification = req.session.verification;
	if (!verification) return res.status(400).json({ success: false, error: 'Missing verification' })
	const { userid, verificationCode } = verification;
	const user = await noblox.getPlayerInfo(userid);
	if (!user) return res.status(400).json({ success: false, error: 'Invalid user' })
	if (!user.blurb.includes(verificationCode)) return res.status(400).json({ success: false, error: 'Invalid verification code' })
	const password = req.body.password;
	await req.session.destroy();
	req.session.userid = userid;
	await req.session.save();

	let thumbnail = await getRobloxThumbnail(userid);
	if(!thumbnail) thumbnail = null;

	await prisma.user.upsert({
		where: {
			userid: BigInt(userid)
		}, 
		update: {
			info: {
				upsert: {
					create: {
						passwordhash: await bcrypt.hash(password, 10)
					},
					update: {
						passwordhash: await bcrypt.hash(password, 10)
					}
				}
			}
		},
		create: {
			userid: BigInt(userid),
			picture: thumbnail,
			info: {
				create: {
					passwordhash: await bcrypt.hash(password, 10)
				}
			}
		}
	});

	res.status(200).json({ success: true })
}
