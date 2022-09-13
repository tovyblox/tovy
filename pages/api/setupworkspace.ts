// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

type Data = {
	name: string
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	prisma.config.create({
		data: {
			key: "base_config",
			value: {
				groupid: req.body.groupid
			}
		}
	});

	

	res.status(200).json({ name: 'John Doe' })
}
