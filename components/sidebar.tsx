import type { NextPage } from "next";
import { loginState, workspacestate } from "@/state";
import { useRecoilState } from "recoil";
import { Menu, Listbox } from "@headlessui/react";
import { useRouter } from "next/router";
import { IconHome, IconWall, IconClipboardList, IconSpeakerphone, IconUsers, IconSettings, IconChevronDown, IconFileText, IconLogout, IconCheck } from "@tabler/icons";
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
			accessable: workspace.settings.sessionsEnabled,
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
			name: "Docs",
			href: "/workspace/[id]/docs",
			icon: IconFileText,
			accessable: workspace.settings.guidesEnabled,
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
				<Menu as="div" className="relative inline-block w-full text-left">
					<div className="w-full">
						<Menu.Button className="h-auto flex flex-row rounded-xl py-1 hover:bg-gray-200 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800 px-2 transition cursor-pointer focus-visible:bg-gray-200 focus-visible:outline-none w-full" tabIndex={0} role="button">
							<img
								src={login?.thumbnail}
								alt="image url"
								className="rounded-full bg-primary h-12 w-12 my-auto"
							/>
							<p className="my-auto text-sm pl-3 text-left">
								Signed in as
								<br />
								<span className="font-bold">{login?.displayname}</span>
							</p>
						</Menu.Button>
					</div>
					<Menu.Items className="absolute left-0 z-20 mt-2 w-56 origin-top-left rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-300 focus-visible:outline-none">
						<div className="py-1">
							<Menu.Item>
								{({ active }) => (
									<a
										className={`${active ? "bg-tovybg text-white" : "text-gray-700 dark:text-white"
											}  px-3 py-2 text-sm rounded-md m-1 mb-0 font-medium flex flex-row cursor-pointer`}
									>
										<IconSettings size={22} className="inline-block" />
										<p className="ml-2"> Account settings </p>
									</a>
								)}
							</Menu.Item>
							<Menu.Item>
								{({ active }) => (
									<a
										className={`${active ? "bg-tovybg text-white" : "text-gray-700 dark:text-white"
											}  px-3 py-2 text-sm rounded-md m-1 mb-0 font-medium flex flex-row cursor-pointer`}
									>
										<IconLogout size={22} className="inline-block" />
										<p className="ml-2"> Logout </p>
									</a>
								)}
							</Menu.Item>
						</div>
					</Menu.Items>
				</Menu>

				<Listbox onChange={() => { }} value={workspace.groupId} as="div" className="relative inline-block w-full text-left">
					<Listbox.Button className="h-auto w-full flex flex-row rounded-xl py-1 hover:bg-gray-200 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800 px-2 transition cursor-pointer outline-1 outline-gray-300 outline mb-1 focus-visible:bg-gray-200">
						<img
							src={workspace.groupThumbnail}
							alt="group name"
							className="rounded-full h-[36px] w-[36px] my-auto p-1"
						/>
						<p className="my-auto text-xl pl-2 font-medium">
							Tovy
						</p>
						<IconChevronDown size={18} color="#AAAAAA" className="my-auto ml-auto" />
					</Listbox.Button>
					<Listbox.Options className="absolute left-0 z-20 mt-2 w-56 origin-top-left rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-300 focus-visible:outline-none overflow-clip">
						<div className="">
							{login?.workspaces?.map((ws, index) => (
								<Listbox.Option
									className={({ active }) =>
										`${active ? 'text-white bg-primary' : 'text-gray-900'} relative cursor-pointer select-none py-2 pl-3 pr-9`
									}
									key={index}
									value={ws.groupId}
								>
									{({ selected, active }) => (
										<>
											<div className="flex items-center">
												<img
													src={workspace.groupThumbnail}
													alt="group name"
													className="rounded-full h-[32px] w-[32px] my-auto p-0"
												/>
												<span
													className={`${selected ? 'font-semibold' : 'font-normal'} ml-2 block truncate text-xl`}
												>
													{ws.groupName}
												</span>
											</div>

											{selected ? (
												<span
													className={`${active ? 'text-white' : 'text-primary'}
																absolute inset-y-0 right-0 flex items-center pr-4`
													}
												>
													<IconCheck className="h-5 w-5" aria-hidden="true" />
												</span>
											) : null}
										</>
									)}
								</Listbox.Option>
							))}
						</div>

					</Listbox.Options>
				</Listbox>
				<div className="h-[1px] rounded-xl w-full px-3 bg-gray-300 mb-1" />
				{pages.map((page, i) => (
					(page.accessable?.valueOf ? page.accessable : true) && (
						<button key={i} className={`h-auto flex flex-row rounded-xl  py-1 px-2 transition cursor-pointer focus-visible:outline-none  ${router.pathname === page.href ? `bg-primary text-white hover:bg-primary/50 focus-visible:bg-primary/50 dark:text-black dark:bg-white dark:focus-visible:bg-gray-300 dark:hover:bg-gray-300` : "text-black dark:text-white hover:bg-gray-200 focus-visible:bg-gray-200 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800"}`} tabIndex={0} role="button" onClick={() => gotopage(page.href)}>
							<page.icon size={36} className="my-auto p-1" />
							<p className="my-auto text-xl pl-2 font-medium">
								{page.name}
							</p>
						</button>
					)
				))}
			</div>
		</div>
	);
};

export default Topbar;
