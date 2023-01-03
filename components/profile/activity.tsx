import React, { Fragment, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import { FC } from '@/types/settingsComponent'
import { Chart, ChartData, ScatterDataPoint } from "chart.js"
import { Line } from "react-chartjs-2";
import type { ActivitySession, Quota, inactivityNotice } from "@prisma/client";
import Tooltip from "../tooltip";
import moment from "moment";
import { Dialog, Transition } from "@headlessui/react";
import Button from "../button";
import { IconMessages, IconMoon, IconPlayerPlay, IconWalk } from "@tabler/icons";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/router";

type Props = {
	timeSpent: number;
	timesPlayed: number;
	data: any;
	quotas: Quota[];
	sessionsHosted: number;
	sessionsAttended: number;
	avatar: string;
	sessions: (ActivitySession & {
		user: {
			picture: string | null;
		};
	})[];
	notices: inactivityNotice[];
}

const Activity: FC<Props> = ({ timeSpent, timesPlayed, data, quotas, sessionsAttended, sessionsHosted, avatar, sessions, notices }) => {
	const router = useRouter();
	const { id } = router.query;

	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [loading, setLoading] = useState(true)
	const [chartData, setChartData] = useState<ChartData<"line", (number | ScatterDataPoint | null)[], unknown>>({
		datasets: []
	});
	const [chartOptions, setChartOptions] = useState({});
	const [timeline, setTimeline] = useState<any>([...sessions, ...notices]);
	const [isOpen, setIsOpen] = useState(false);
	const [dialogData, setDialogData] = useState<any>({});

	useEffect(() => {
		setTimeline(timeline.sort((a: any, b: any) => {
			const dateA = new Date(a.startTime).getTime();
			const dateB = new Date(b.endTime).getTime();
			return dateB - dateA;
		}));

		setChartData({
			labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			datasets: [
				{
					label: "Activity in minutes",
					data,
					borderColor: "rgb(var(--group-theme))",
					backgroundColor: "rgb(var(--group-theme))",
					tension: 0.25,
				}
			]
		});

		setChartOptions({
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					position: "top"
				},
			},
			scales: {
				y: {
					beginAtZero: true
				}
			}
		})
	}, []);

	const getQuotaPercentage = (quota: Quota) => {
		switch (quota.type) {
			case "mins": {
				return (timeSpent / quota.value) * 100;
			}
			case "sessions_hosted": {
				return (sessionsHosted / quota.value) * 100;
			}
			case "sessions_attended": {
				return (sessionsAttended / quota.value) * 100;
			}
		}
	}

	const getQuotaProgress = (quota: Quota) => {
		switch (quota.type) {
			case "mins": {
				return `${timeSpent} / ${quota.value} minutes`;
			}
			case "sessions_hosted": {
				return `${sessionsHosted} / ${quota.value} sessions hosted`;
			}
			case "sessions_attended": {
				return `${sessionsAttended} / ${quota.value} sessions attended`;
			}
		}
	}

	const idleMins = sessions.reduce((acc, session) => { return acc + Number(session.idleTime) }, 0);
	const messages = sessions.reduce((acc, session) => { return acc + Number(session.messages) }, 0);

	const fetchSession = async (sessionId: string) => {
		setLoading(true);
		setIsOpen(true);
		try {
			const { data, status } = await axios.get(`/api/workspace/${id}/activity/${sessionId}`);
			if (status !== 200) return toast.error("Could not fetch session.");
			if (!data.universe) {
				setLoading(false)
				return setDialogData({
					type: "session",
					data: data.message,
					universe: null
				});
				
			}

			setDialogData({
				type: "session",
				data: data.message,
				universe: data.universe
			});
			setLoading(false)
		} catch (error) {
			return toast.error("Could not fetch session.");
		}
	}

	const types: {
		[key: string]: string

	} = {
		"mins": "minutes",
		"sessions_hosted": "sessions hosted",
		"sessions_attended": "sessions attended"
	}

	return (
		<>
			<Toaster position="bottom-center" />
			<div className="mt-2">
				<div className="grid gap-4 xl:grid-cols-2">
					<div>
						<div className="bg-white p-4 rounded-md mb-4">
							<p className="font-semibold text-2xl">Current week</p>
						</div>
						<div className="bg-white p-2 rounded-md">
							<Line options={chartOptions} data={chartData} />
						</div>
						<div className="bg-white p-4 rounded-md mt-4">
							<p className="font-semibold text-2xl">Timeline</p>
							{!sessions.length && <p>There is no timeline for this user.</p>}
							<ol className={`relative border-l border-gray-200 ml-3 ${sessions.length ? "mt-3" : ""}`}>
								{timeline.map((session: any, index: number) => (
									<div key={session.id}>
										{"reason" in session ? (
											<li className="mb-10 ml-6">
												<span className="flex absolute -left-3 justify-center items-center w-6 h-6 bg-primary rounded-full ring-4 ring-white">
													<img className="rounded-full" src={avatar} alt="timeline avatar" />
												</span>
												<div className="justify-between items-center p-4 bg-white rounded-lg border border-gray-200 sm:flex">
													<time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">{moment(session.startTime).format("DD MMMM YYYY")} to {moment(session.endTime).format("DD MMMM YYYY")}</time>
													<p className="text-lg font-semibold">Inactivity Notice - {session.reason}</p>
												</div>
											</li>
										) : (
											<li className="mb-10 ml-6">
												<span className="flex absolute -left-3 justify-center items-center w-6 h-6 bg-primary rounded-full ring-4 ring-white">
													<img className="rounded-full" src={session.user.picture ? session.user.picture : avatar} alt="timeline avatar" />
												</span>
												<div className="justify-between items-center p-4 bg-white rounded-lg border border-gray-200 sm:flex cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => fetchSession(session.id)}>
													<time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">{moment(session.startTime).format("HH:mm")} to {moment(session.endTime).format("HH:mm")} on {moment(session.startTime).format("dddd[, ] DD MMMM YYYY")}</time>
													<p className="text-lg font-semibold">Activity Session</p>
												</div>
											</li>
										)}
									</div>
								))}
							</ol>
						</div>
					</div>
					<div className="grid gap-2 grid-cols-1">
						<div>
							<div className="bg-white p-4 rounded-md mb-4">
								<p className="font-semibold text-2xl">Since last timeframe</p>
							</div>
							<div className="bg-white p-4 rounded-md">
								<p className="font-medium text-xl leading-4 mt-1 text-gray-400">Time spent in-game</p>
								<p className="mt-3 text-8xl font-extralight">{timeSpent}m</p>
							</div>
							<div className="bg-white p-4 rounded-md mt-4">
								<p className="font-medium text-xl leading-4 mt-1 text-gray-400">Times played</p>
								<p className="mt-3 text-8xl font-extralight">{timesPlayed} {timesPlayed == 1 ? 'time' : 'times'}</p>
							</div>
							<div className="bg-white p-4 rounded-md mt-4">
								<p className="font-medium text-xl leading-4 mt-1 text-gray-400">Messages sent</p>
								<p className="mt-3 text-8xl font-extralight">{messages} {messages == 1 ? 'message' : 'msgs'}</p>
							</div>
							<div className="bg-white p-4 rounded-md mt-4">
								<p className="font-medium text-xl leading-4 mt-1 text-gray-400">Idle minutes</p>
								<p className="mt-3 text-8xl font-extralight">{idleMins}m</p>
							</div>
						</div>

					</div>

				</div>



				<div className="mt-4">
					<div className="bg-white p-4 rounded-md mb-4">
						<p className="font-semibold text-2xl">Quotas</p>
						{!quotas.length && <p>There are no quotas assigned to this user.</p>}
						<div className={`grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${quotas.length ? "mt-3" : "mt-0"}`}>
							{quotas.map((notice: any) => (
								<div className="bg-white p-4 rounded-md ring-1 ring-gray-300" key={notice.id}>
									<h2 className="text-lg font-semibold">
										{notice.name}
									</h2>
									<p
										className={`font-semibold`}
									>
										{notice.value} {types[notice.type]} per timeframe
									</p>
									<Tooltip orientation="top" tooltipText={getQuotaProgress(notice)} isWorkspace>
										<div className="w-full rounded-full h-6 mt-2 bg-gray-300 overflow-clip"> <div className="bg-primary h-full" style={{
											width: `${getQuotaPercentage(notice)}%`,
										}}></div>  </div>
									</Tooltip>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<Transition appear show={isOpen} as={Fragment}>
				<Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all">
									{!loading && (
										<>
										 {dialogData.universe && (
											<img className="object-cover h-[128px] w-full" draggable="false" src={dialogData?.universe?.thumbnail} alt="thumbnail" />
										 )}
										</>
									)}
									{loading && (
										<div className="h-[128px] w-full bg-gray-200 animate-pulse" />
									)}

									<div className="p-4">
										<div className="bg-white p-2 border rounded-lg border-gray-200 mb-3 text-center shadow-sm">
											{!loading && <p className="text-lg font-bold">{dialogData?.universe?.name || 'Unknown Universe'}</p>}
											{loading && (
												<div className="h-3 my-2 bg-gray-200 mx-auto rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
											)}
										</div>

										<div className="flex flex-row space-x-1">
											<IconMoon className="my-auto p-0.5" />
											{!loading && <p className="my-auto pl-1">Time spent idling - <strong>{Math.round(dialogData.data.idleTime)} minutes</strong></p>}
											{loading && (
												<div className="my-auto pl-1 h-2 w-64 rounded-full bg-gray-200"></div>
											)}
										</div>
										<div className="flex flex-row space-x-1">
											<IconWalk className="my-auto p-0.5" />
											{!loading && <p className="my-auto pl-1">Time spent active - <strong>{Math.round(((new Date(dialogData.data.endTime).getTime() - new Date(dialogData.data.startTime).getTime()) - dialogData.data.idleTime) / 60000)} minutes</strong></p>}
											{loading && (
												<div className="my-auto pl-1 h-2 w-64 rounded-full bg-gray-200"></div>
											)}
										</div>
										<div className="flex flex-row space-x-1">
											<IconMessages className="my-auto p-0.5" />
											{!loading && <p className="my-auto pl-1">Messages sent - <strong>{dialogData.data.messages ? dialogData.data.messages : "Not tracked"}</strong></p>}
											{loading && (
												<div className="my-auto pl-1 h-2 w-64 rounded-full bg-gray-200"></div>
											)}
										</div>
										<div className="flex flex-row space-x-1">
											<IconPlayerPlay className="my-auto p-0.5" />
											{!loading && <p className="my-auto pl-1">Total time spent - <strong>{Math.round((new Date(dialogData.data.endTime).getTime() - new Date(dialogData.data.startTime).getTime()) / 60000)} minutes</strong></p>}
											{loading && (
												<div className="my-auto pl-1 h-2 w-64 rounded-full bg-gray-200"></div>
											)}
										</div>

										<div className="mt-4 flex">
											<Button classoverride="bg-red-500 hover:bg-red-300 ml-0 w-full" onPress={() => setIsOpen(false)}> Close </Button>
										</div>
									</div>
								</Dialog.Panel>

							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
};

export default Activity;