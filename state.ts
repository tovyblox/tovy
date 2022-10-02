import { atom, selector } from "recoil";
import Router from "next/router";
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
		workspaces: [] as workspaceinfo[]
	},
});

export {loginState};