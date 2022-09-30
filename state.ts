import { atom, selector } from "recoil";
import Router from "next/router";
import axios from "axios";
const loginState = atom({
	key: "loginState",
	default: {
		userId: 1,
		username: '',
		displayname: '',
		thumbnail: '',
	},
});

export {loginState};