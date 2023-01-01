import { PrismaClient, role, workspace, user, Session, SessionType, schedule, ActivitySession, document, wallPost, inactivityNotice, sessionUser, Quota, Ally, allyVisit } from "@prisma/client";

declare global {
    var prisma: PrismaClient;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') globalThis.prisma = prisma

// Middleware to hide passwordhash and tfa configurations from API responses


export type { role, workspace, user, Session, SessionType, schedule, ActivitySession, document, wallPost, inactivityNotice, sessionUser, Quota, Ally, allyVisit };
export default prisma as PrismaClient;