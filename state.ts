import { atom, selector } from "recoil";
import Router from "next/router";
import { role } from "@prisma/client";
import axios from "axios";
export type workspaceinfo = {
	groupId: number;
				groupThumbnail: string;
				groupName: string
}
const loginState = atom({
	key: "loginState",
	default: {
		userId: 1,
		username: '',
		displayname: '',
		thumbnail: '',
		canMakeWorkspace: false,
		workspaces: [] as workspaceinfo[]
		
	},
});

const workspacestate = atom({
	key: "workspacestate",
	default: {
		groupId: 1,
		groupThumbnail: '',
		groupName: '',
		yourPermission: [] as string[],
		groupTheme: '',
		roles: [] as role[],
		yourRole: '',
		settings: {
			guidesEnabled: false,
			sessionsEnabled: false,
			noticesEnabled: false,
			widgets: [] as string[]
		}
	}
});


export {loginState, workspacestate};