import { PrismaClient, role, workspace, user, Session, SessionType, schedule, ActivitySession, document } from "@prisma/client";

declare global {
    var prisma: PrismaClient;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') globalThis.prisma = prisma

// Middleware to hide passwordhash and tfa configurations from API responses

async function convertAllBigIntsToNumbersMiddleware(params: any, next: any) {
	let result = await next(params)

	for (const key in result) {
		if (typeof result[key] === 'bigint') {
			console.log(result[key])
			const number = Number(result[key])
			delete result[key]
			result[key] = number
			console.log(result[key])
		}
	};

	return result
}
prisma.$use(convertAllBigIntsToNumbersMiddleware)
async function excludePasswordMiddleware(params: any, next: any) {
	const result = await next(params)

	if (params?.model === 'user' && params?.args?.select?.passwordhash !== true) {
		delete result.passwordhash
	}

	if (params?.model === 'user' && params?.args?.select?.tfa !== true) {
		delete result.tfa
	}

	return result
}

prisma.$use(excludePasswordMiddleware);

export type { role, workspace, user, Session, SessionType, schedule, ActivitySession, document };
export default prisma as PrismaClient;