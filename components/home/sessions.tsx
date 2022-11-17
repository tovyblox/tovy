import axios from "axios";
import React, { useState } from "react";
import type toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import Button from "@/components/button";
import type { Session, user } from "@/utils/database";
import { useRouter } from "next/router";
import { IconChevronRight } from '@tabler/icons'


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
		<div>
			<p className="text-3xl font-medium mb-5">Ongoing sessions</p>
			<div className="gap-y-2 flex flex-col">
				{activeSessions.map(session => (
					<div className="" key={session.id}>
						<div className="bg-[url('https://tr.rbxcdn.com/4a3833e22d4523b58e173057a531a766/768/432/Image/Png')] w-full rounded-md overflow-clip">
							<div className="px-5 py-4 backdrop-blur flex">
								<div><p className="text-xl font-bold"> Training session </p>
									<div className="flex mt-1">
										<img src={session.owner.picture!} className="bg-primary rounded-full w-8 h-8 my-auto" />
										<p className="font-semibold pl-2 leading-5 my-auto"> Hosted by ItsWHOOOP <br /> <span className="text-red-500"> Slocked </span> </p>
									</div>
								</div>

							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
};


export default Color;