import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Button from "@/components/button";
import Workspace from "@/layouts/workspace";
import { useRecoilState } from "recoil";
import { useEffect, useState, useMemo } from "react";
import randomText from "@/utils/randomText";
import Tooltip from "@/components/tooltip";
import axios from "axios";
import { useRouter } from "next/router";
import prisma, { schedule, SessionType, Session, user, role } from "@/utils/database";
import { GetServerSideProps } from "next";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import moment from "moment";

export const getServerSideProps: GetServerSideProps = withPermissionCheckSsr(async ({ query }) => {
	const sessions = await prisma.schedule.findMany({
		where: {
			sessionType: {
				workspaceGroupId: parseInt(query.id as string)
			}
		},
		include: {
			sessionType: {
				include: {
					hostingRoles: true
				}
			},
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



	return {
		props: {
			sessions: JSON.parse(JSON.stringify(sessions, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof sessions,
		}
	}
});
type esession = (schedule & {
	sessionType: (SessionType & {
		hostingRoles: role[]
	});
	sessions: (Session & {
		owner: user
	})[];
})

const Home: pageWithLayout<{
	sessions: esession[]
}> = ({ sessions }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const router = useRouter();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [activeSessions, setActiveSessions] = useState<esession[]>([]);
	const [sessionsData, setSessionsData] = useState(sessions);
	const [doingAction, setDoingAction] = useState(false);
	const text = useMemo(() => randomText(login.displayname), []);

	const gradients = [
		`to-[#8f75e5] from-[#5c3e8d]`,
		`to-orange-500 from-orange-700`,
		`to-[#f7b733] from-[#de751f]`,
		`to-blue-500 from-blue-700`,
		`to-red-500 from-red-700`,
		`to-green-500 from-green-700`,
		`to-purple-500 from-purple-700`,
		`to-yellow-500 from-yellow-700`,
		`to-pink-500 from-pink-700`,	
	]

	const getLastThreeDays = useMemo(() => {
			const today = new Date();
			console.log(today)
			const lastThreeDays = [];
			const nextThreeDays = [];
			for (let i = 0; i < 4; i++) {
				const day = new Date(today);
				day.setDate(day.getDate() - i);
				day.setMinutes(0)
				day.setHours(0)
				lastThreeDays.push(day);
			}
			for (let i = 0; i < 3; i++) {
				const day = new Date(today);
				day.setDate(day.getDate() + i + 1);
				day.setMinutes(0)
				day.setHours(0)
				nextThreeDays.push(day);
			}
			return [...lastThreeDays, ...nextThreeDays].sort((a, b) => a.getTime() - b.getTime());
	}, []);


	const claimSession = async (schedule: any) => {
		setDoingAction(true);
		console.log(selectedDate)
		const res = await axios.post(`/api/workspace/${router.query.id}/sessions/manage/${schedule.id}/claim`, {
			date: selectedDate.getTime(),
			timezoneOffset: new Date().getTimezoneOffset()
		});

		if (res.status === 200) {
			const curentSessions = sessionsData;
			//filter out the session that was claimed
			const newSessions = curentSessions.filter((session: any) => session.id !== schedule.id);
			setSessionsData([...newSessions, res.data.session]);
			setDoingAction(false);
		}
	};

	const unclaimSession = async (schedule: any) => {
		setDoingAction(true);
		console.log(selectedDate)
		const res = await axios.post(`/api/workspace/${router.query.id}/sessions/manage/${schedule.id}/unclaim`, {
			date: selectedDate.getTime(),
			timezoneOffset: new Date().getTimezoneOffset()
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
		const activeSessions = sessionsData.filter((session: any) => {
			return session.Days.includes(selectedDate.getDay());
		});
		setActiveSessions(activeSessions);
	}, [selectedDate, sessionsData]);

	const checkDisabled = (session: esession) => {
		const s = session.sessions.find(e => new Date(e.date).getUTCDate() === selectedDate.getUTCDate());
		const findRole = session.sessionType.hostingRoles.find(e => e.id === workspace.yourRole);
		if (!findRole && !workspace.yourPermission.includes('manage_sessions')) return {
			disabled: true,
			text: "You don't have the required role to host this session"
		};
		const date = new Date();
		date.setUTCDate(selectedDate.getUTCDate());
		date.setUTCFullYear(selectedDate.getUTCFullYear());
		date.setUTCMonth(selectedDate.getUTCMonth());
		date.setUTCHours(session.Hour)
		date.setUTCMinutes(session.Minute)
		date.setUTCSeconds(0);
		date.setUTCMilliseconds(0);
		//if the session already started or ended
		if (date < new Date()) return {
			disabled: true,
			text: "This session has already started"
		};

		if (!s?.date) return { disabled: false, text: "Claims the session so people know you\'re the host" };
		console.log(s.date)
		if (s.date < new Date()) {
			return {
				disabled: true,
				text: "Session already started"
			};
		}
		return { disabled: false, text: "Claims the session so people know you\'re the host" }
	}

	return <div className="pagePadding">
		<p className="text-4xl font-bold">{text}</p>
		<button onClick={() => router.push(`/workspace/${router.query.id}/sessions/new`)} className="cardBtn"><p className="font-bold text-2xl leading-5 mt-1"> New session type <br /><span className="text-gray-400 font-normal text-base "> Create a new session type   </span></p> </button>
		<p className="text-3xl font-medium mt-5">Schedule</p>
		<div className=" pt-5 flex flex-col lg:flex-row gap-x-3 gap-y-2">
			<div className="flex flex-col w-full md:w-3/6 xl:w-2/6 2xl:w-1/6 gap-y-3 ">
				{getLastThreeDays.map((day, i) => (
					<button key={i} className={`flex flex-col bg-white rounded-md  outline-[1.4px] outline text-left px-3 py-2 hover:bg-gray-100 focus-visible:bg-gray-100 ${selectedDate.getDate() === day.getDate() ? 'outline-primary' : ' outline-gray-300'}`} onClick={() => setSelectedDate(day)}>
						<p className="text-2xl font-semibold">{day.toLocaleDateString()}</p>
						<p className="text-xl font-base text-slate-400/75 -mt-1">{day.toLocaleDateString("en-US", { weekday: "long" })}</p>
					</button>
				))}
			</div>
			{!!activeSessions.length && <div className="flex flex-col w-full lg:w-4/6 xl:w-5/6 gap-y-3">
				{activeSessions.map((session) => {
					const date = new Date();
					date.setUTCMinutes(session.Minute);
					date.setUTCHours(session.Hour);
					date.setUTCDate(selectedDate.getUTCDate());
					date.setUTCMonth(selectedDate.getUTCMonth());
					date.setUTCFullYear(selectedDate.getUTCFullYear());

					for (const s of session.sessions) {
						const d8 = new Date(s.date);
						const d2 = selectedDate.getUTCDate();
						console.log(`${s.id} is on ${d8.getUTCDate()} (${d8.getDate()}) and selected is ${d2}`)
					}
					
					return (
						<div className="" key={session.id}>
							<div className={`to-primary from-primary/75 bg-gradient-to-t w-full rounded-md overflow-clip text-white`}>
								<div className="px-5 py-4 backdrop-blur flex z-10">
									<div><p className="text-xl font-semibold"> {session.sessionType.name} </p>
										{session.sessions.find(e => new Date(e.date).getUTCDate() === selectedDate.getUTCDate()) ?
											<div className="flex mt-1">
												<img src={(session.sessions.find(e => new Date(e.date).getUTCDate() === selectedDate.getUTCDate())?.owner.picture as string)} className="bg-primary rounded-full w-8 h-8 my-auto" />
												<p className="font-medium pl-2 leading-5 my-auto"> Hosted by {session.sessions.find(e => new Date(e.date).getUTCDate() === selectedDate.getUTCDate())?.owner.username} <br /> <span className=""> {`${moment(date).format(`hh:mm A`)}`} </span> </p>
											</div>
											: <p className="font-medium leading-5 my-auto">Unclaimed <br /> <span className=""> {`${moment(date).format(`hh:mm A`)}`} </span>  </p>}
									</div>
									<div className="ml-auto my-auto z-50">
										<Tooltip tooltipText={checkDisabled(session).text} orientation="left">
										{Number(session.sessions.find(e => new Date(e.date).getUTCDate() === selectedDate.getUTCDate())?.ownerId) === Number(login.userId) ? <Button classoverride="my-auto ml-auto" onPress={() => unclaimSession(session,)} loading={doingAction} disabled={checkDisabled(session).disabled} > Unclaim  </Button> : <Button classoverride="my-auto ml-auto" onPress={() => claimSession(session,)} loading={doingAction} disabled={checkDisabled(session).disabled} > Claim  </Button>}
										</Tooltip>
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>}
			{!activeSessions.length && (
				<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
					<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
					<p className="text-center text-xl font-semibold">No sessions scheduled for {selectedDate.toLocaleDateString()}.</p>
				</div>
			)}


		</div>

	</div>;
};

Home.layout = Workspace;

export default Home;
