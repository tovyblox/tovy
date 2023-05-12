import Activity from "@/components/profile/activity";
import Book from "@/components/profile/book";
import Notices from "@/components/profile/notices";
import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import { withSessionSsr } from "@/lib/withSession";
import { loginState } from "@/state";
import { Tab } from "@headlessui/react";
import { getDisplayName, getUsername, getThumbnail } from "@/utils/userinfoEngine";
import { ActivitySession, Quota } from "@prisma/client";
import prisma from "@/utils/database";
import moment from "moment";
import { InferGetServerSidePropsType } from "next";
import { useRecoilState } from "recoil";

export const getServerSideProps = withPermissionCheckSsr(
	async ({ query, req }) => {
		const userTakingAction = await prisma.user.findFirst({
			where: {
				userid: BigInt(query.uid as string)
			},
			include: {
				roles: {
					where: {
						workspaceGroupId: parseInt(query.id as string)
					},
					include: {
						assignedQuotas: true
					}
				}
			}
		});
		if (!parseInt(query?.id as string) && !userTakingAction?.roles[0].isOwnerRole && !userTakingAction?.roles[0].permissions.includes('manage_activity')) return { notFound: true };
		const notices = await prisma.inactivityNotice.findMany({
			where: {
				userId: BigInt(query?.uid as string),
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
				userId: BigInt(parseInt(query?.uid as string)),
				active: false
			},
			include: {
				user: {
					select: {
						picture: true
					}
				}
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

		if(sumOfMs.length) timeSpent = sumOfMs.reduce((p, c) => p + c);
		else timeSpent = 0;
		timeSpent = Math.round(timeSpent / 60000);
		
		moment.locale("es")

		const startOfWeek = moment().startOf("week").toDate();
		const endOfWeek = moment().endOf("week").toDate();

		const weeklySessions = await prisma.activitySession.findMany({
			where: {
				active: false,
				userId: BigInt(query?.uid as string),
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

		const ubook = await prisma.userBook.findMany({
			where: {
				userId: BigInt(query?.uid as string)
			},
			include: {
				admin: true
			},
			orderBy: {
				createdAt: "desc"
			}
		});

		const sessionsAttended = await prisma.sessionUser.findMany({
			where: {
				userid: BigInt(query?.uid as string),
				session: {
					ended: {
						not: null
					}
				}
			},
		});

		const sesisonsHosted = await prisma.session.findMany({
			where: {
				ownerId: BigInt(query?.uid as string),
				ended: {
					not: null
				}
			}
		});

		return {
			props: {
				notices: (JSON.parse(JSON.stringify(notices, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof notices),
				timeSpent,
				timesPlayed: sessions.length,
				data,
				sessions: (JSON.parse(JSON.stringify(sessions, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof sessions),
				info: {
					username: await getUsername(parseInt(query?.uid as string)),
					displayName: await getDisplayName(parseInt(query?.uid as string)),
					avatar: await getThumbnail(parseInt(query?.uid as string))
				},
				isUser: req.session.userid === parseInt(query?.uid as string),
				sesisonsHosted: sesisonsHosted.length,
				sessionsAttended: sessionsAttended.length,
				quotas: userTakingAction?.roles[0].assignedQuotas,
				userBook: (JSON.parse(JSON.stringify(ubook, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof ubook)
			}
		};
	}
)

type pageProps = {
	notices: any;
	timeSpent: number;
	timesPlayed: number;
	data: number[];
	sessions: (ActivitySession & {
		user: {
			picture: string | null;
		};
	})[];
	info: {
		username: string;
		displayName: string;
		avatar: string;
	}
	userBook: any;
	quotas: Quota[];
	sesisonsHosted: number;
	sessionsAttended: number;
	isUser: boolean;
}
const Profile: pageWithLayout<pageProps> = ({ notices, timeSpent, timesPlayed, data, sessions, userBook, isUser, info, sesisonsHosted, sessionsAttended, quotas }) => {
	const [login, setLogin] = useRecoilState(loginState)

	return <div className="pagePadding">
		<div className="flex items-center mb-6">
			<img src={info.avatar} className="rounded-full bg-primary h-16 w-16 my-auto" alt="Avatar Headshot" />
			<div className="ml-3">
				<h2 className="text-4xl font-bold">{info.displayName}</h2>
				<p className="text-gray-500">@{info.username}</p>
			</div>
		</div>
		{!isUser && <Tab.Group>
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
					<Activity timeSpent={timeSpent} timesPlayed={timesPlayed} data={data} sessionsAttended={sessionsAttended} sessionsHosted={sesisonsHosted} quotas={quotas} avatar={info.avatar} sessions={sessions} notices={notices} />
				</Tab.Panel>
				<Tab.Panel>
					<Book userBook={userBook} />
				</Tab.Panel>
				<Tab.Panel>
					<Notices notices={notices} />
				</Tab.Panel>
			</Tab.Panels>
		</Tab.Group>}
		{
			isUser && <Activity timeSpent={timeSpent} timesPlayed={timesPlayed} data={data} quotas={quotas} sessionsAttended={sessionsAttended} sessionsHosted={sesisonsHosted} avatar={info.avatar} sessions={sessions} notices={notices} />
		}
		
	</div>;
}

Profile.layout = workspace

export default Profile