import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import { FC } from '@/types/settingsComponent'
import { Chart, ChartData, ScatterDataPoint } from "chart.js"
import { Line } from "react-chartjs-2";
import type { Quota } from "@prisma/client";
import Tooltip from "../tooltip";

type Props = {
	timeSpent: number;
	timesPlayed: number;
	data: any;
	quotas: Quota[];
	sessionsHosted: number;
	sessionsAttended: number;
}

const Activity: FC<Props> = ({ timeSpent, timesPlayed, data, quotas, sessionsAttended, sessionsHosted }) => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [chartData, setChartData] = useState<ChartData<"line", (number | ScatterDataPoint | null)[], unknown>>({
		datasets: []
	});
	const [chartOptions, setChartOptions] = useState({});

	useEffect(() => {
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
				return (timesPlayed / quota.value) * 100;
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
				return `${timesPlayed} / ${quota.value} minutes`;
			}
			case "sessions_hosted": {
				return `${sessionsHosted} / ${quota.value} sessions hosted`;
			}
			case "sessions_attended": {
				return `${sessionsAttended} / ${quota.value} sessions attended`;
			}
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
		<div className="mt-2 ">
			<div className="grid gap-4 xl:grid-cols-2">
				<div>
					<div className="bg-white p-4 rounded-md mb-4">
						<p className="font-semibold text-2xl">Current week</p>
					</div>
					<div className="bg-white p-2 rounded-md">
						<Line options={chartOptions} data={chartData} />
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
					</div>
					<div className="bg-white p-4 rounded-md">
						<p className="font-medium text-xl leading-4 mt-1 text-gray-400">Times played</p>
						<p className="mt-3 text-8xl font-extralight">{timesPlayed} {timesPlayed == 1 ? 'time' : 'times'}</p>
					</div>
				</div>

			</div>
			<div className="mt-4">
				<div className="bg-white p-4 rounded-md mb-4">
					<p className="font-semibold text-2xl">Qutoas</p>
					<div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-2">
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
	);
};

export default Activity;