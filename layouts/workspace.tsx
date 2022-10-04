import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Sidebar from "../components/sidebar";

import type { LayoutProps } from "../layoutTypes";
import axios from 'axios'
import { useRecoilState } from "recoil";
import { workspacestate } from "../state";
import { useRouter } from "next/router";
import { useEffect } from "react";

const workspace: LayoutProps = ({ children }) => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const router = useRouter()
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
			setWorkspace(res.data.workspace);
		}
		getworkspace();
	}, []);
	return (
		<div>
			<Head>
				<title>{workspace.groupName}</title>
			</Head>
			<div className="flex">
				<div className="w-48"> <Sidebar /></div>
				<main className="bg-gray-100 w-full"> {children} </main>
			</div>
		</div>
	)
}

export default workspace;
