import * as IronSession from "iron-session";
declare module "iron-session" {
	interface IronSessionData {
	  userid: number;
	}
  }

export type User = {
	userId: number
	username: string
	displayname: string
	thumbnail: string
}