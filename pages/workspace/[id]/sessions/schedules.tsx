import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Button from "@/components/button";
import Workspace from "@/layouts/workspace";
import toast, { Toaster } from 'react-hot-toast'
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

	const editSession = (session: any) => {
		router.push(`/workspace/${router.query.id}/sessions/${session.sessionType.id}/edit`);
	};


	const deleteSession = async (session: any) => {
		const res = axios.post(`/api/workspace/${router.query.id}/sessions/manage/${session.sessionType.id}/delete`, {});
		toast.promise(res, {
			loading: 'Deleting session...',
			success: () => {
				setSessionsData(sessionsData.filter((s) => s.id !== session.id));
				return 'Session deleted';
			},
			error: (err) => {
				return err.response.data.message;
			}
		});
	};

	useEffect(() => {
		const activeSessions = sessionsData.filter((session: any) => {
			return session.Days.includes(selectedDate.getDay());
		});
		setActiveSessions(activeSessions);
	}, [selectedDate, sessionsData]);

	const getDates = (dates: number[]) => {
		if (dates.length === 7) return "Everyday";
		if (dates.length === 5 && !dates.includes(0) && !dates.includes(6)) return "Weekdays";
		if (dates.length === 2 && dates.includes(0) && dates.includes(6)) return "Weekends";
		return "on " + dates.map((date) => {
			switch (date) {
				case 0:
					return "Sun";
				case 1:
					return "Mon";
				case 2:
					return "Tue";
				case 3:
					return "Wed";
				case 4:
					return "Thu";
				case 5:
					return "Fri";
				case 6:
					return "Sat";
			}
		}
		).join(", ");

	}


	return <div className="pagePadding">
		<p className="text-4xl font-bold">{text}</p>
		<button onClick={() => router.push(`/workspace/${router.query.id}/sessions/new`)} className="cardBtn"><p className="font-bold text-2xl leading-5 mt-1"> New session type <br /><span className="text-gray-400 font-normal text-base "> Create a new session type   </span></p> </button>
		<p className="text-3xl font-medium mt-5">Schedules</p>
		<div className=" pt-5 flex flex-col lg:flex-row gap-x-3 gap-y-2">
			{!!activeSessions.length && <div className="flex flex-col w-full gap-y-2">
				{activeSessions.map((session) => {
					const date = new Date(selectedDate);
					date.setUTCMinutes(session.Minute)
					date.setUTCHours(session.Hour)
					return (
						<div className="" key={session.id}>
							<div className={`to-primary from-primary/75 bg-gradient-to-t w-full rounded-md overflow-clip text-white`}>
								<div className="px-5 py-4 backdrop-blur flex z-10">
									<div><p className="text-xl font-semibold"> {session.sessionType.name} </p>
										<p className="font-medium leading-5 my-auto">{ getDates(session.Days )} at {moment(date).format(`hh:mm A`)}  </p>
									</div>
									<div className="ml-auto my-auto z-50">
										<Button classoverride="my-auto ml-auto" onPress={() => editSession(session,)} loading={doingAction} > Edit  </Button>
										<Button classoverride="hover:bg-red-300 bg-red-600 focus-visible:bg-red-300 ml-2" onPress={() => deleteSession(session)} loading={doingAction} > Delete  </Button>
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
					<p className="text-center text-xl font-semibold">No session schedules found.</p>
				</div>
			)}
			<Toaster />

		</div>

	</div>;
};

Home.layout = Workspace;

export default Home;
