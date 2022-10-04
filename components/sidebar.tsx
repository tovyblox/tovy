import type { NextPage } from "next";
import { loginState } from "../state";
import { useRecoilState } from "recoil";
import { Menu } from "@headlessui/react";
import { useRouter } from "next/router";
import { IconHome, IconWall, IconClipboardList, IconSpeakerphone, IconUsers, IconSettings } from "@tabler/icons";
import Image from "next/image";
import axios from "axios";

const Topbar: NextPage = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const pages = [
		{
			name: "Home",
			href: "/workspace/[id]",
			icon: IconHome,
			current: false,
		},
		{
			name: "Wall",
			href: "/workspace/[id]/wall",
			icon: IconWall,
			current: false,
		},
		{
			name: "Activity",
			href: "/workspace/[id]/activity",
			icon: IconClipboardList,
			current: false,
		},
		{
			name: "Sessions",
			href: "/workspace/[id]/wall",
			icon: IconSpeakerphone,
			current: false,
		},
		{
			name: "Views",
			href: "/workspace/[id]/wall",
			icon: IconUsers,
			current: false,
		},
		{
			name: "Settings",
			href: "/workspace/[id]/wall",
			icon: IconSettings,
			current: false,
		},


	]
	const router = useRouter();

	return (
		<aside className="h-screen w-48 bg-white drop-shadow dark:bg-gray-900 ">
			<div className="flex flex-col py-3 px-3 gap-2">
				<a className="h-auto flex flex-row rounded-xl py-1 hover:bg-gray-200 dark:hover:bg-gray-800 px-2 transition cursor-pointer">
					<img
						src={login?.thumbnail}
						className="rounded-full bg-tovybg h-12 w-12 my-auto"
					/>
					<p className="my-auto text-sm pl-3">
						Signed in as
						<br />
						<span className="font-bold"> {login?.displayname}</span>
					</p>
				</a>
				<a className="h-auto flex flex-row rounded-xl py-1 hover:bg-gray-200 dark:hover:bg-gray-800 px-2 transition cursor-pointer outline-1 outline-[#AAAAAA] outline mb-1">
					<img
						src="/Icon_Transparent.svg"
						className="rounded-full bg-tovybg h-[34px] w-[34px] my-auto p-1"
					/>
					<p className="my-auto text-xl pl-3 font-medium">
						Tovy
					</p>
				</a>
				<div className="h-[1px] rounded-xl w-full px-3 bg-gray-300 mb-1"/> 
				{pages.map((page) => (
					<a className={`h-auto flex flex-row rounded-xl  dark:hover:bg-gray-800 py-1 px-2 transition cursor-pointer  ${router.pathname === page.href ? `bg-tovybg text-white hover:bg-blue-300` : "text-black hover:bg-gray-200"}`}>
					<page.icon size={36} className="my-auto p-1" />
					<p className="my-auto text-xl pl-2 font-medium">
						{page.name}
					</p>
				</a>
				))}
			</div>
		</aside>
	);
};

export default Topbar;
