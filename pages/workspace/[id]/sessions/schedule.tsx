import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import Button from "@/components/button";
import Workspace from "@/layouts/workspace";
import { IconChevronRight } from "@tabler/icons";
import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import prisma, { schedule, SessionType, Session, user } from "@/utils/database";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import { type } from "node:os";
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const sessions = await prisma.schedule.findMany({
		where: {
			sessionType: {
				workspaceGroupId: parseInt(query.id as string)
			}
		},
		include: {
			sessionType: true,
			sessions: {
				include: {
					owner: true
				}
			}
		}
	});

	//find sessions that are already claimed by a user
	//get date 3 days from now
	const threeDaysFromNow = new Date();
	threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
	const threeDaysBeforeNow = new Date();
	threeDaysBeforeNow.setDate(threeDaysBeforeNow.getDate() - 3);

	console.log(JSON.parse(JSON.stringify(sessions))[0])



	return {
		props: {
			sessions: JSON.parse(JSON.stringify(sessions)),
		}
	}
};
type esession = (schedule & {
	sessionType: SessionType;
	sessions: (Session & {
		owner: user
	})[];
})

const Home: pageWithLayout<{
	sessions: esession[]
}> = ({ sessions }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const router = useRouter();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [activeSessions, setActiveSessions] = useState<esession[]>([]);
	const [sessionsData, setSessionsData] = useState(sessions);
	const [doingAction, setDoingAction] = useState(false);

	function getLastThreeDays() {
		const today = new Date();
		const lastThreeDays = [];
		const nextThreeDays = [];
		for (let i = 0; i < 4; i++) {
			const day = new Date(today);
			day.setDate(day.getDate() - i);
			lastThreeDays.push(day);
		}
		for (let i = 0; i < 3; i++) {
			const day = new Date(today);
			day.setDate(day.getDate() + i + 1);
			nextThreeDays.push(day);
		}
		return [...lastThreeDays, ...nextThreeDays].sort((a, b) => a.getTime() - b.getTime());
	};


	const claimSession = async (schedule: any) => {
		setDoingAction(true);
		const res = await axios.post(`/api/workspace/${router.query.id}/sessions/manage/${schedule.id}/claim`, {
			date: selectedDate
		});

		if (res.status === 200) {
			const curentSessions = sessionsData;
			//filter out the session that was claimed
			const newSessions = curentSessions.filter((session: any) => session.id !== schedule.id);
			setSessionsData([...newSessions, res.data.session]);
			setDoingAction(false);
		}
	};

	useEffect(() => {
		console.log(sessions)
		const activeSessions = sessionsData.filter((session: any) => {
			console.log(sessions)
			return session.Days.includes(selectedDate.toLocaleDateString("en-US", { weekday: "short" }))
		});
		setActiveSessions(activeSessions);
	}, [selectedDate, sessionsData]);

	const checkDisabled = (session: esession) => {
		const s = session.sessions.find(e => new Date(e.date).getDate() === selectedDate.getDate());
		console.log(s)
		//if the session already started or ended
		if (selectedDate.getTime() < new Date().getTime()) return { disabled: true, text: "Session Ended" };
		if (s?.ownerId === login.userId) {
			return {
				disabled: true,
				text: "You already claimed this session"
			};
		}

		if (!s?.date) return { disabled: false, text: "Claim" };
		console.log(s.date)
		if (s.date < new Date()) {
			return {
				disabled: true,
				text: "Session already started"
			};
		}
		return { disabled: false, text: "Claim" }
	}

	return <div className="px-28 py-20">
		<p className="text-4xl font-bold">Good morning, {login.displayname}</p>
		<button onClick={() => router.push(`/workspace/${router.query.id}/sessions/new`)} className="cardBtn"><p className="font-bold text-2xl leading-5 mt-1"> New session type <br /><span className="text-gray-400 font-normal text-base "> Create a new session type   </span></p> </button>
		<p className="text-3xl font-medium mt-5">Schedule</p>
		<div className=" pt-5 flex flex-col lg:flex-row gap-x-3 gap-y-2">
			<div className="flex flex-col w-full lg:w-3/6 xl:w-1/6 gap-y-3 ">
				{getLastThreeDays().map((day, i) => (
					<button className={`flex flex-col bg-white rounded-md  outline-[1.4px] outline text-left px-3 py-2 hover:bg-gray-100 focus-visible:bg-gray-100 ${selectedDate.getDate() === day.getDate() ? 'outline-primary' : ' outline-gray-300'}`} onClick={() => setSelectedDate(day)}>
						<p className="text-2xl font-semibold">{day.toLocaleDateString()}</p>
						<p className="text-xl font-base text-slate-400/75 -mt-1">{day.toLocaleDateString("en-US", { weekday: "long" })}</p>
					</button>
				))}
			</div>
			<div className="flex flex-col w-full lg:4/6 xl:5/6 gap-y-3">
				{activeSessions.map((session) => (
					<div className="">
						<div className="bg-[url('https://tr.rbxcdn.com/4a3833e22d4523b58e173057a531a766/768/432/Image/Png')] w-full rounded-md overflow-clip">
							<div className="px-5 py-4 backdrop-blur flex">
								<div><p className="text-xl font-semibold"> {session.sessionType.name} </p>
									{session.sessions.find(e => new Date(e.date).getDate() === selectedDate.getDate()) ?
										<div className="flex mt-1">
											<img src={(session.sessions.find(e => new Date(e.date).getDate() === selectedDate.getDate())?.owner.picture as string)} className="bg-primary rounded-full w-8 h-8 my-auto" />
											<p className="font-medium pl-2 leading-5 my-auto"> Hosted by {session.sessions.find(e => new Date(e.date).getDate() === selectedDate.getDate())?.owner.username} <br /> <span className="text-primary"> {`${session.Hour}:${session.Minute.toString().padStart(2, '0')}`} </span> </p>
										</div>
										: <p className="font-medium leading-5 my-auto">Unclaimed </p>}
								</div>
								<Button classoverride="my-auto ml-auto" onPress={() => claimSession(session,)} loading={doingAction} > Claim  </Button>
								<Button classoverride="my-auto ml-3"> Join game </Button>
							</div>
						</div>
					</div>
				))}
			</div>
			{!activeSessions.length && (
				<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
					<img className="mx-auto my-auto h-full" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
					<p className="text-center text-xl font-semibold">No sessions scheduled for {selectedDate.toLocaleDateString()}</p>
				</div>
			)}

		</div>

	</div>;
};

Home.layout = Workspace;

export default Home;
