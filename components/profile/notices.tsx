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
			<div className="grid gap-1 grid-cols-3">
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