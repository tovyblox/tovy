import type { NextPage } from "next";
import { loginState, workspacestate} from "@/state";
import { useRecoilState } from "recoil";
import { Menu } from "@headlessui/react";
import { useRouter } from "next/router";
import { IconHome, IconWall, IconClipboardList, IconSpeakerphone, IconUsers, IconSettings, IconChevronDown } from "@tabler/icons";
import Image from "next/image";
import axios from "axios";
import workspace from "@/layouts/workspace";

const Topbar: NextPage = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
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
			href: "/workspace/[id]/sessions",
			icon: IconSpeakerphone,
			current: false,
		},
		{
			name: "Views",
			href: "/workspace/[id]/views",
			icon: IconUsers,
			current: false,
		},
		{
			name: "Settings",
			href: "/workspace/[id]/settings",
			icon: IconSettings,
			current: false,
		},
	]

	const gotopage = (page: string) => {
		router.push(page.replace("[id]", workspace.groupId.toString()));
	}
	const router = useRouter();

	return (
		<div className="sticky top-0 w-48 h-screen bg-white drop-shadow dark:bg-gray-900">
			<div className="flex flex-col py-3 px-3 gap-2 focus-visible:bg-blue-200">
				<button className="h-auto flex flex-row rounded-xl py-1 hover:bg-gray-200 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800 px-2 transition cursor-pointer focus-visible:bg-gray-200 focus-visible:outline-none" tabIndex={0} role="button">
					<img
						src={login?.thumbnail}
						className="rounded-full bg-primary h-12 w-12 my-auto"
					/>
					<p className="my-auto text-sm pl-3 text-left">
						Signed in as
						<br />
						<span className="font-bold">{login?.displayname}</span>
					</p>
				</button>
				<button className="h-auto flex flex-row rounded-xl py-1 hover:bg-gray-200 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800 px-2 transition cursor-pointer outline-1 outline-gray-300 outline mb-1 focus-visible:bg-gray-200" tabIndex={0} role="button">
					<img
						src={workspace.groupThumbnail}
						className="rounded-full h-[36px] w-[36px] my-auto p-1"
					/>
					<p className="my-auto text-xl pl-2 font-medium">
						Tovy
					</p>
					<IconChevronDown size={18} color="#AAAAAA" className="my-auto ml-auto" />
				</button>
				<div className="h-[1px] rounded-xl w-full px-3 bg-gray-300 mb-1"/> 
				{pages.map((page) => (
					<button className={`h-auto flex flex-row rounded-xl  py-1 px-2 transition cursor-pointer focus-visible:outline-none  ${router.pathname === page.href ? `bg-primary text-white hover:bg-primary/50 focus-visible:bg-primary/50 dark:text-black dark:bg-white dark:focus-visible:bg-gray-300 dark:hover:bg-gray-300` : "text-black dark:text-white hover:bg-gray-200 focus-visible:bg-gray-200 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800"}`} tabIndex={0} role="button" onClick={() => gotopage(page.href)}>
						<page.icon size={36} className="my-auto p-1" />
						<p className="my-auto text-xl pl-2 font-medium">
							{page.name}
						</p>
					</button>
				))}
			</div>
		</div>
	);
};

export default Topbar;
