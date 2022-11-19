import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import { FC } from '@/types/settingsComponent'
import { Chart, ChartData, ScatterDataPoint } from "chart.js"
import { Line } from "react-chartjs-2";

type props = {
	test: string;
}

const Activity: FC<props> = ({ test }) => {
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
					data: [50, 24, 85, 125, 26, 52, 68],
					borderColor: "rgb(var(--group-theme) / <alpha-value>)",
					backgroundColor: "rgb(var(--group-theme) / <alpha-value>)",
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
				<div className="bg-white p-2 rounded-md">
					<Line options={chartOptions} data={chartData} />
				</div>
				<div className="grid gap-2 grid-cols-1">
					<div className="bg-white p-4 rounded-md">
						<p className="font-bold text-2xl leading-4 mt-1">Time spent in-game</p>
						<p className="mt-3 text-8xl text-gray-400 font-thin">430m</p>
					</div>
					<div className="bg-white p-4 rounded-md">
						<p className="font-bold text-2xl leading-4 mt-1">Times played</p>
						<p className="mt-3 text-8xl text-gray-400 font-thin">9 times</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Activity;