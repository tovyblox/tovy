import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import { FC } from '@/types/settingsComponent'
import { Chart, ChartData, ScatterDataPoint } from "chart.js"
import { Line } from "react-chartjs-2";

type Props = {
	timeSpent: number;
	timesPlayed: number;
	data: any;
}

const Activity: FC<Props> = ({ timeSpent, timesPlayed, data }) => {
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
			}
		})
	}, []);

	return (
		<div className="mt-2">
			<div className="grid gap-4 grid-cols-2">
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
							<p className="font-semibold text-2xl">Lifetime</p>
						</div>
						<div className="bg-white p-4 rounded-md">
							<p className="font-bold text-2xl leading-4 mt-1">Time spent in-game</p>
							<p className="mt-3 text-8xl text-gray-400 font-thin">{timeSpent}m</p>
						</div>
					</div>
					<div className="bg-white p-4 rounded-md">
						<p className="font-bold text-2xl leading-4 mt-1">Times played</p>
						<p className="mt-3 text-8xl text-gray-400 font-thin">{timesPlayed} {timesPlayed == 1 ? 'time' : 'times'}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Activity;