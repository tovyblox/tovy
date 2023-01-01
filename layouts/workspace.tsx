/* eslint-disable react-hooks/rules-of-hooks */
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Sidebar from "@/components/sidebar";
import type { LayoutProps } from "@/layoutTypes";
import axios from 'axios'
import { Transition } from "@headlessui/react";
import { IconMenu2 } from "@tabler/icons";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import { useRouter } from "next/router";
import hexRgb from "hex-rgb";
import * as colors from 'tailwindcss/colors'
import { useEffect, useState } from "react";

const workspace: LayoutProps = ({ children }) => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [isMobile, setIsMobile] = useState(false)

	const useTheme = (groupTheme: string) => {
		const themes: any = {
			"bg-[#2196f3]": "#2196f3",
			"bg-blue-500": colors.blue[500],
			"bg-red-500": colors.red[500],
			"bg-red-700": colors.red[700],
			"bg-green-500": colors.green[500],
			"bg-green-600": colors.green[600],
			"bg-yellow-500": colors.yellow[500],
			"bg-orange-500": colors.orange[500],
			"bg-purple-500": colors.purple[500],
			"bg-pink-500": colors.pink[500],
			"bg-black": colors.black,
			"bg-gray-500": colors.gray[500],
		}
		const hex = hexRgb(themes[groupTheme || "bg-[#2196f3]"] || "#2196f3")
		const theme = `${hex.red} ${hex.green} ${hex.blue}`
		return theme
	}

	useEffect(() => {
		router.events.on('routeChangeStart', () => {
			setLoading(true)
		});
		router.events.on('routeChangeComplete', () => {
			setLoading(false)
		});
	}, [])


	useEffect(() => {
		async function getworkspace() {
			let res;
			try {
				res = await axios.get('/api/workspace/' + router.query.id);
			} catch (e: any) {
				if (e?.response?.status === 400) {
					router.push('/')
					return;
				}
				if (e?.response?.status === 401) {
					router.push('/')
					return;
				}
				if (e?.response?.status === 404) {
					router.push('/')
					return;
				}
				return;
			}
			if (!res) return;
			//set the css var
			setWorkspace({
				...res.data.workspace,
				groupTheme: res.data.workspace.groupTheme.color,
			});
		}
		getworkspace();
	}, []);

	useEffect(() => {
		const theme = useTheme(workspace.groupTheme || 'bg-[#2196f3]')
		document.documentElement.style.setProperty('--group-theme', theme);
	}, [workspace.groupTheme]);

	useEffect(() => {
		if (window.innerWidth < 768) {
			setIsMobile(true)
		} else {
			setIsMobile(false)
		}
		

		window.addEventListener('resize', () => {
			if (window.innerWidth < 768) {
				setIsMobile(true)
			} else {
				setIsMobile(false)
			}
		});
		return () => {
			window.removeEventListener('resize', () => {
				if (window.innerWidth < 768) {
					setIsMobile(true)
				} else {
					setIsMobile(false)
				}
			})
		}
	}, [])

	return (
		<div>
			<Head>
				<title>{workspace.groupName || 'Loading...'}</title>
				<link rel="icon" href={`${workspace.groupThumbnail}/isCircular`} />
			</Head>

			<div className={`flex `}>
				<Transition show={open && isMobile} as="div" className={"z-50"}>
					<Transition.Child
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25 cursor-pointer" onClick={() => setOpen(!open)} />
					</Transition.Child>
					<Transition.Child
						enter="transition duration-100 ease-out"
						enterFrom="transform opacity-0 -translate-x-full"
						enterTo="transform opacity-100 translate-x-0"
						leave="transition duration-75 ease-out"
						leaveFrom="transform translate-x-0"
						leaveTo="transform opacity-0 -translate-x-full"
					>
						<div className="w-60 h-screen fixed top-0 z-50" id="sidebar"><Sidebar /></div>

					</Transition.Child>
				</Transition>
				{!isMobile && <div className="w-60 h-screen sticky right-0 top-0" id="sidebar"><Sidebar /></div>}

				{loading && (
					<div className="flex h-screen w-full bg-gray-100">
						<svg
							aria-hidden="true"
							className="w-24 h-24 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 my-auto mr-auto ml-auto"
							viewBox="0 0 100 101"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
								fill="currentColor"
							/>
							<path
								d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
								fill="currentFill"
							/>
						</svg>
					</div>
				)}
				<main className={`bg-gray-100 dark:bg-gray-700 w-full overflow-y-scroll ${loading ? 'hidden' : ''} `}>
					{isMobile && (<div className="z-10 w-screen bg-white drop-shadow flex-row flex 2xl:px-48 lg:px-32 md:px-20 sm:px-14 px-8 dark:bg-gray-900 ">
						<div className="h-full flex flex-row w-full py-1">
							<button className="h-auto flex flex-row mr-auto rounded-xl py-1 hover:bg-gray-200 dark:hover:bg-gray-800 px-2 transition cursor-pointer" onClick={() => setOpen(!open)}>
								<IconMenu2 className="text-primary h-8 w-8" />
							</button>
						</div>
					</div>)}
					{children}
				</main>
			</div>
		</div>

	)
}

export default workspace;
