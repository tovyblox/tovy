import React from "react";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";

import { FC } from '@/types/settingsComponent'
import { inactivityNotice } from "@prisma/client";
import moment from "moment";

type Props = {
	notices: inactivityNotice[]
}

const Notices: FC<Props> = ({ notices }) => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);	

	return (
		<div className="mt-2">
			{notices.length < 1 && (
				<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
					<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
					<p className="text-center text-xl font-semibold">This user does not have any past notices.</p>
				</div>
			)}
			<div className="grid gap-1 xl:grid-cols-3 lg:grid-cols-2">
				{notices.map((notice) => (
					<div className="bg-white p-4 rounded-md" key={notice.id}>
						<h2 className="text-lg font-semibold">
							{moment(new Date(notice.startTime)).format("MMM Do YYYY")} - {moment(new Date(notice.endTime as Date)).format("MMM Do YYYY")}
						</h2>
						<p className="text-gray-500">{notice.reason}</p>
						<p
							className={`${notice.reviewed ? notice.approved ? `text-green-600` : `text-red-600` : `text-amber-600`} font-semibold`}
						>
							{notice.reviewed ? notice.approved ? `Approved` : `Declined` : `Under review`}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default Notices;