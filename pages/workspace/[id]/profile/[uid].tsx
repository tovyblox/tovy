import Activity from "@/components/profile/activity";
import Book from "@/components/profile/book";
import Notices from "@/components/profile/notices";
import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { withSessionSsr } from "@/lib/withSession";
import { loginState } from "@/state";
import { Tab } from "@headlessui/react";
import { ActivitySession } from "@prisma/client";
import prisma from "@/utils/database";
import moment from "moment";
import { InferGetServerSidePropsType } from "next";
import { useRecoilState } from "recoil";

export const getServerSideProps = withSessionSsr(
	async ({ query, req }) => {
		const notices = await prisma.inactivityNotice.findMany({
			where: {
				userId: req.session.userid,
				workspaceGroupId: parseInt(query?.id as string),
			},
			orderBy: [
				{
					startTime: "desc"
				}
			]
		});

		const sessions = await prisma.activitySession.findMany({
			where: {
				userId: parseInt(query?.uid as string),
				active: false
			},
			orderBy: {
				endTime: "desc"
			}
		});

		var sumOfMs: number[] = [];
		var timeSpent: number;

		sessions.forEach((session: ActivitySession) => {
			sumOfMs.push(session.endTime?.getTime() as number - session.startTime.getTime());
		});

		timeSpent = sumOfMs.reduce((p, c) => p + c);
		timeSpent = Math.round(timeSpent / 60000);
		
		moment.locale("es")

		const startOfWeek = moment().startOf("week").toDate();
		const endOfWeek = moment().endOf("week").toDate();

		const weeklySessions = await prisma.activitySession.findMany({
			where: {
				active: false,
				userId: req.session.userid,
				startTime: {
					lte: endOfWeek,
					gte: startOfWeek
				}
			},
			orderBy: {
				startTime: "asc"
			}
		});

		type Day = {
			day: number;
			ms: number[];
		}

		const days: Day[] = [
			{
				day: 1,
				ms: []
			},
			{
				day: 2,
				ms: []
			},
			{
				day: 3,
				ms: []
			},
			{
				day: 4,
				ms: []
			},
			{
				day: 5,
				ms: []
			},
			{
				day: 6,
				ms: []
			},
			{
				day: 0,
				ms: []
			}
		];

		weeklySessions.forEach((session: ActivitySession) => {
			const day = session.startTime.getDay();
			const calc = Math.round((session.endTime?.getTime() as number - session.startTime.getTime()) / 60000);
			days.find(x => x.day == day)?.ms.push(calc);
		});

		const data: number[] = [];

		days.forEach((day) => {
			if(day.ms.length < 1) return data.push(0);
			data.push(day.ms.reduce((p, c) => p + c));
		});

		return {
			props: {
				notices: (JSON.parse(JSON.stringify(notices, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof notices),
				timeSpent,
				timesPlayed: sessions.length,
				data
			}
		};
	}
)

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Profile: pageWithLayout<pageProps> = ({ notices, timeSpent, timesPlayed, data }) => {
	const [login, setLogin] = useRecoilState(loginState)

	return <div className="px-28 py-20">
		<div className="flex items-center mb-6">
			<img src="https://tr.rbxcdn.com/6bd2862461a5c2d84da136cf2c33db3f/60/60/AvatarHeadshot/Png" className="rounded-full bg-primary h-16 w-16 my-auto" alt="Avatar Headshot" />
			<div className="ml-3">
				<h2 className="text-4xl font-bold">WHOOOP</h2>
				<p className="text-gray-500">@ItsWHOOOP</p>
			</div>
		</div>
		<Tab.Group>
			<Tab.List className="flex py-1 space-x-4">
			<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Activity
				</Tab>
				<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Userbook
				</Tab>
				<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Notices
				</Tab>
			</Tab.List>
			
			<Tab.Panels>
				<Tab.Panel>
					<Activity timeSpent={timeSpent} timesPlayed={timesPlayed} data={data} />
				</Tab.Panel>
				<Tab.Panel>
					<Book />
				</Tab.Panel>
				<Tab.Panel>
					<Notices notices={notices} />
				</Tab.Panel>
			</Tab.Panels>
		</Tab.Group>
	</div>;
}

Profile.layout = workspace

export default Profile