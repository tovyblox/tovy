import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import Button from "@/components/button";
import Workspace from "@/layouts/workspace";
import { IconChevronRight } from "@tabler/icons";
import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import prisma from "@/utils/database";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const sessions = await prisma.schedule.findMany({
		where: {
			sessionType: {
				workspaceGroupId: parseInt(query.id as string) 
			}
		},
		include: {
			sessionType: true
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
			sessions: sessions,
		}
	}
};

const Home: pageWithLayout = ({ sessions }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
	const [login, setLogin] = useRecoilState(loginState);
	const router = useRouter();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [activeSessions, setActiveSessions] = useState([]);
	const [sessionsData, setSessionsData] = useState(sessions);

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

	const claimSession = async (schedule: any, date: EpochTimeStamp) => {
		const res = await axios.post(`/api/workspace/${router.query.id}/sessions/${schedule.id}/claim`, {
			date: date
		});
	
		if (res.status === 200) {
			const curentSessions = sessionsData;
			//filter out the session that was claimed
			const newSessions = curentSessions.filter((session: any) => session.id !== schedule.id);
			setSessionsData([...newSessions, res.data.session]);
		}


	};

	useEffect(() => {
		console.log(sessions)
		const activeSessions = sessionsData.filter((session: any) => {
			console.log(sessions)
			return session.Days.includes(selectedDate.toLocaleDateString("en-US", { weekday: "short" }))
		});
		setActiveSessions(activeSessions);
	}, [selectedDate]);




	return <div className="px-28 py-20">
		<p className="text-4xl font-bold">Good morning, {login.displayname}</p>
		<button onClick={() => router.push(`/workspace/${router.query.id}/sessions/new`)} className="px-5 py-4  bg-white rounded-md mt-3 w-full border-[1.4px] text-left hover:bg-gray-100 focus-visible:bg-gray-100 focus:outline-none"><p className="font-bold text-2xl leading-5 mt-1"> New session type <br /><span className="text-gray-400 font-normal text-base "> Create a new session type   </span></p> </button>
		<p className="text-3xl font-medium mt-5">Schedule</p>
		<div className=" pt-5 flex flex-col lg:flex-row gap-x-3 gap-y-2">
			<div className="flex flex-col w-full lg:w-2/6 xl:w-1/6 gap-y-3 ">
				{getLastThreeDays().map((day, i) => (
					<button className={`flex flex-col bg-white rounded-md  outline-[1.4px] outline text-left px-3 py-2 hover:bg-gray-100 focus-visible:bg-gray-100 ${selectedDate.getDate() === day.getDate() ? 'outline-primary' : ' outline-gray-300'}`} onClick={() => setSelectedDate(day)}>
						<p className="text-2xl font-semibold">{day.toLocaleDateString()}</p>
						<p className="text-xl font-base text-slate-400/75 -mt-1">{day.toLocaleDateString("en-US", { weekday: "long" })}</p>
					</button>

				))}
			</div>
			{activeSessions.map((session: any) => (
				<div className="w-full lg:4/6 xl:5/6">
					<div className="bg-[url('https://tr.rbxcdn.com/4a3833e22d4523b58e173057a531a766/768/432/Image/Png')] w-full rounded-md overflow-clip">
						<div className="px-5 py-4 backdrop-blur flex">
							<div><p className="text-xl font-semibold"> { session.sessionType.name } </p>
								<div className="flex mt-1">
									<img src={login.thumbnail} className="bg-primary rounded-full w-8 h-8 my-auto" />
									<p className="font-medium pl-2 leading-5 my-auto"> Hosted by ItsWHOOOP <br /> <span className="text-red-500"> Slocked </span> </p>
								</div>
							</div>
							<Button classoverride="my-auto ml-auto"> End </Button>
							<Button classoverride="my-auto ml-3 py-3 px-3"> <IconChevronRight size={22} /> </Button>
						</div>
					</div>
				</div>
			))}

		</div>

	</div>;
};

Home.layout = Workspace;

export default Home;
