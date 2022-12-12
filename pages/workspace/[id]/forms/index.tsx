import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import { loginState } from "@/state";
import { getDisplayName, getUsername, getThumbnail } from "@/utils/userinfoEngine";
import { ActivitySession } from "@prisma/client";
import prisma from "@/utils/database";
import { useRecoilState } from "recoil";
import { useMemo, useRef, useState } from "react";
import randomText from "@/utils/randomText";
import FormList from "@/components/forms/FormList";

export const getServerSideProps = withPermissionCheckSsr(
	async ({ query, req }) => {
		return {
			props: {}
		}
	}
)

type pageProps = {}
const Profile: pageWithLayout<pageProps> = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const [activeForms, setActiveForms] = useState([]);
	const [inactiveForms, setInactiveForms] = useState([]);
	const text = useMemo(() => randomText(login.displayname), []);

	const activeCstr = useRef(null);
	const inactiveCstr = useRef(null);

	return <div className="pagePadding space-y-6">
		<p className="text-4xl font-bold">{text}</p>
		<button className="cardBtn">
			<p className="font-bold text-2xl leading-5 mt-1">Create form</p>
			<p className="text-gray-400 font-normal text-base mt-1">Forms allow your members to apply for a specific role.</p>
		</button>
		<h1 className="text-3xl font-bold">Forms</h1>
		<div className="bg-white p-4 rounded-lg !mt-3">
			<h1 className="text-2xl font-semibold mb-3 ml-0.5">Open Forms</h1>
			<div className="grid grid-cols-1 gap-2 mb-4" ref={activeCstr}>
				<FormList />
				<FormList />
			</div>
			<h1 className="text-2xl font-semibold mb-3 ml-0.5">Closed Forms</h1>
			<div className="grid grid-cols-1 gap-2 mb-4" ref={activeCstr}>
				<FormList />
			</div>
		</div>
	</div>;
}

Profile.layout = workspace

export default Profile