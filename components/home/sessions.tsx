import axios from "axios";
import React, { useState } from "react";
import type toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import Button from "@/components/button";
import type { Session, user } from "@/utils/database";
import { useRouter } from "next/router";
import { IconChevronRight } from '@tabler/icons'
import { getThumbnail } from "@/utils/userinfoEngine";


const Color: React.FC = () => {
	const [activeSessions, setActiveSessions] = useState<(Session & {
		owner: user
	})[]>([]);
	const router = useRouter();
	React.useEffect(() => {
		axios.get(`/api/workspace/${router.query.id}/home/activeSessions`).then(res => {
			if (res.status === 200) {
				setActiveSessions(res.data.sessions)
			}
		})
	}, []);

	return (
		<>
			{activeSessions.length > 0 && (
				<>
					<p className="text-3xl font-medium mb-5">Ongoing sessions</p>
					{activeSessions.length < 1 && (
						<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
							<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
							<p className="text-center text-xl font-semibold">There are no ongoing sessions.</p>
						</div>
					)}
					<div className="gap-y-2 flex flex-col">
						{activeSessions.map(session => (
							<div className="" key={session.id}>
								<div className="to-primary from-primary/75 bg-gradient-to-t w-full rounded-md overflow-clip">
									<div className="px-5 py-4 backdrop-blur flex">
										<div><p className="text-xl font-bold"> Training session </p>
											<div className="flex mt-1">
												<img src={String(session.owner.picture)} className="bg-primary rounded-full w-8 h-8 my-auto" />
												<p className="font-semibold pl-2 leading-5 my-auto"> Hosted by {session.owner.username} <br /> <span className="text-red-500"> Slocked </span> </p>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</>
	)
};


export default Color;