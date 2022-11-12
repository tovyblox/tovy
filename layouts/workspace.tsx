import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Sidebar from "@/components/sidebar";
import type { LayoutProps } from "@/layoutTypes";
import axios from 'axios'
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import { useRouter } from "next/router";
import hexRgb from "hex-rgb";
import * as colors from 'tailwindcss/colors'
import { useEffect } from "react";

const workspace: LayoutProps = ({ children }) => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const router = useRouter()
	
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
		const hex = hexRgb(themes[groupTheme])
		const theme = `${hex.red} ${hex.green} ${hex.blue}`
		return theme
	}
	
		
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
	}, [workspace.groupTheme])

	return (
		<div>
			<Head>
				<title>{workspace.groupName || 'Loading...'}</title>
				<link rel="icon" href={`${workspace.groupThumbnail}/isCircular`}/>
			</Head>
			<div className="flex">
				<div className="w-48 h-screen sticky top-0" id="sidebar"> <Sidebar /></div>
				<main className="bg-gray-100 dark:bg-gray-700 w-full overflow-y-scroll"> {children} </main>
			</div>
		</div>
	)
}

export default workspace;
