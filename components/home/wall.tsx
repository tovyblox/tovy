import axios from "axios";
import React, { useState } from "react";
import type toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import moment from "moment";
import Button from "@/components/button";
import type { wallPost, user } from "@/utils/database";
import { useRouter } from "next/router";
import { IconChevronRight } from '@tabler/icons'


const Color: React.FC = () => {
	const [posts, setPosts] = useState<(wallPost & {
		author: user
	})[]>([]);
	const router = useRouter();
	React.useEffect(() => {
		axios.get(`/api/workspace/${router.query.id}/home/wall`).then(res => {
			if (res.status === 200) {
				setPosts(res.data.posts)
			}
		})
	}, []);

	const goToGuide = (id: string) => {
		router.push(`/workspace/${router.query.id}/docs/${id}`)
	}

	return (
		<div>
			<p className="text-3xl font-medium mb-5">Latest Wall Posts</p>
			<div className="flex flex-col gap-3 mt-5">
				{posts.length < 1 && (
					<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
						<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
						<p className="text-center text-xl font-semibold">The wall is empty.</p>
					</div>
				)}
				{posts.slice(0, 2).map((post) => (
					<div className="bg-white p-4 rounded-md" key={post.id}>
						<div className="flex">
							<img alt="avatar headshot" src={String(post.author.picture)} className="rounded-full h-12 w-12 my-auto bg-primary" />
							<p className="font-semibold ml-2 break-normal leading-5 my-auto">
								{post.author.username!}
								<br />
								<span className="text-gray-500/75 font-normal"> {moment(post.createdAt).format("DD MMM")} </span>
							</p>
						</div>
						<p className="pt-2 font-medium">{post.content}</p>
					</div>
				))}
			</div>
		</div>
	)
};


export default Color;