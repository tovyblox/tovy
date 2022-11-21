import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import * as crypto from "crypto";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
} from "next";

if (!process.env.SESSION_SECRET) throw new Error(`SESSION_SECRET is missing from ENV\nYou can safely set it to: ${crypto.randomBytes(32).toString("hex")}`);

const sessionOptions = {
  password: process.env.SESSION_SECRET, 
  cookieName: "tovy_session",
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  }
};

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

// Theses types are compatible with InferGetStaticPropsType https://nextjs.org/docs/basic-features/data-fetching#typescript-use-getstaticprops
export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  handler: (
    context: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  return withIronSessionSsr(handler, sessionOptions);
}