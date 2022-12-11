import axios from "axios";
import React, { useState } from "react";
import type toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import Button from "@/components/button";
import type { document, user } from "@/utils/database";
import { useRouter } from "next/router";
import { IconChevronRight } from '@tabler/icons'


const Color: React.FC = () => {
	const [docs, setDocs] = useState<(document & {
		owner: user
	})[]>([]);
	const router = useRouter();
	React.useEffect(() => {
		axios.get(`/api/workspace/${router.query.id}/home/docs`).then(res => {
			if (res.status === 200) {
				setDocs(res.data.docs)
			}
		})
	}, []);

	const goToGuide = (id: string) => {
		router.push(`/workspace/${router.query.id}/docs/${id}`)
	}
	

	return (
		<div>
			<p className="text-3xl font-medium mb-5">Docs</p>
			{docs.length < 1 && (
				<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
					<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
					<p className="text-center text-xl font-semibold">There are no published documents.</p>
				</div>
			)}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
				{docs.slice(0, 3).map((document) => (
					<div className="" key={document.id} onClick={() => goToGuide(document.id)}>
						<div className="px-5 py-4 backdrop-blur flex cardBtn cursor-pointer">
							<div><p className="text-xl font-bold"> {document.name} </p>
								<div className="flex mt-1">
									<img src={document.owner?.picture!} alt="owner picture" className="bg-primary rounded-full w-8 h-8 my-auto" />
									<p className="font-semibold pl-2 leading-5 my-auto"> Created by {document.owner?.username} </p>
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