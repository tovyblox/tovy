import { PrismaClient, role, workspace, user } from "@prisma/client";

declare global {
    var prisma: PrismaClient;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') globalThis.prisma = prisma

export type { role, workspace, user };
export default prisma as PrismaClient;