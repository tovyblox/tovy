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
			<p className="text-3xl font-medium mb-5">Ongoing sessions</p>
			<div className="grid grid-cols-3 gap-5 mt-5">
			{docs.map((document) => (
				<div className="" key={document.id} onClick={() => goToGuide(document.id)}>
					<div className="px-5 py-4 backdrop-blur flex cardBtn cursor-pointer">
						<div><p className="text-xl font-bold"> {document.name} </p>
							<div className="flex mt-1">
								<img src={document.owner?.picture!} className="bg-primary rounded-full w-8 h-8 my-auto" />
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