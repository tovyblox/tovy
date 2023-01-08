import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import Button from "@/components/button";
import Workspace from "@/layouts/workspace";
import { IconChevronRight } from "@tabler/icons";
import prisma, { Session, user, SessionType } from "@/utils/database";
import { useRecoilState } from "recoil";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import randomText from "@/utils/randomText";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";

import { withPermissionCheckSsr } from "@/utils/permissionsManager";



export const getServerSideProps = withPermissionCheckSsr(async ({ query }) => {
	const sessions = await prisma.session.findMany({
		where: {
			startedAt: {
				lte: new Date()
			},
			ended: null,
			sessionType: {
				workspaceGroupId: parseInt(query.id as string)
			},
		},
		include: {
			owner: true,
			sessionType: true
		}
	});
	return {
		props: {
			sessions: (JSON.parse(JSON.stringify(sessions, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof sessions)
		},
	}
})

type pageProps = {
	sessions: (Session & {
		owner: user,
		sessionType: SessionType
	})[]
}
const Home: pageWithLayout<pageProps> = (props) => {
	const [login, setLogin] = useRecoilState(loginState);
	const [sessions, setSessions] = useState(props.sessions);
	const text = useMemo(() => randomText(login.displayname), []);
	const [statues, setStatues] = useState(new Map<string, string>)

	const router = useRouter();

	const endSession = async (id: string) => {
		await axios.delete(`/api/workspace/${router.query.id}/sessions/manage/${id}/end`, {});
		setSessions(sessions.filter((session) => session.id !== id));
	}

	useEffect(() => {
		const getAllStatues = async () => {
			for (const session of sessions) {
				for (const e of session.sessionType.statues.sort((a, b) => {
					const object = JSON.parse(JSON.stringify(a));
					const object2 = JSON.parse(JSON.stringify(b));
					return object2.timeAfter - object.timeAfter;
				})) {
					//get how many minutes the session has been going on
					const minutes = (new Date().getTime() - new Date(session.date).getTime()) / 1000 / 60;
					const slot = JSON.parse(JSON.stringify(e));
					if (slot.timeAfter < minutes) {
						statues.set(session.id, slot.name);
						return;
					}
				}
				statues.set(session.id, "Open")
			}
		}
		getAllStatues();
		
		setInterval(() => {
			getAllStatues();
		}, 10000)
	}, [sessions])



	return <div className="pagePadding">
		<p className="text-4xl font-bold">{text}</p>
		<p className="text-3xl font-medium mt-5 mb-5">Ongoing sessions</p>
		{sessions.map(session => {
			return (
				<div className="" key={session.id}>
					<div className="to-primary from-primary/75 bg-gradient-to-t w-full rounded-md overflow-clip text-white">
						<div className="px-5 py-4 backdrop-blur flex">
							<div><p className="text-xl font-bold"> {session.sessionType.name} </p>
								<div className="flex mt-1">
									<img src={String(session.owner.picture)} className="bg-primary rounded-full w-8 h-8 my-auto" />
									<p className="font-semibold pl-2 leading-5 my-auto"> {session.owner.username} <br /> {statues.get(session.id)}  </p>
								</div>
							</div>
							<Button classoverride="my-auto ml-auto" onClick={() => endSession(session.id)}> End </Button>
						</div>
					</div>
				</div>
			)
		})}
		{!sessions.length && (
			<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
				<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
				<p className="text-center text-xl font-semibold">No sessions are ongoing</p>
			</div>
		)}
		<p className="text-3xl font-medium mt-10">Manage</p>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
			<button onClick={() => router.push(`/workspace/${router.query.id}/sessions/schedule`)} className="cardBtn"> <p className="text-2xl font-semibold leading-5 mt-2 text-left"> View schedule <br /> <span className="text-gray-400 font-normal text-base" > View this workspaces session schedule </span> </p> </button>
			<button onClick={() => router.push(`/workspace/${router.query.id}/sessions/schedules`)} className="cardBtn"> <p className="text-2xl font-semibold leading-5 mt-2 text-left"> View & Edit schedules <br /> <span className="text-gray-400 font-normal text-base" > Edit the session schedules </span> </p> </button>
		</div>
	</div>;
};

Home.layout = Workspace;

export default Home;
