import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Workspace from "@/layouts/workspace";
import { useState } from "react";
import { useRecoilState } from "recoil";
import Button from "@/components/button";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import prisma from "@/utils/database"
import { wallPost } from "@prisma/client";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import axios from "axios";
import { getUsername } from "@/utils/userinfoEngine";

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
	if(!params?.id) {
		res.statusCode = 404;
		return {
			props: {}
		}
	}

	const posts = await prisma.wallPost.findMany({
		where: {
			workspaceGroupId: parseInt(params.id as string)
		},
		orderBy: {
			createdAt: "desc"
		},
		include: {
			author: {
				select: {
					username: true
				}
			}
		}
	});

	return {
		props: {
			posts: (JSON.parse(JSON.stringify(posts, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof posts)
		}
	}
}

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Settings: pageWithLayout<pageProps> = ({ posts }) => {
	const router = useRouter();
	const { id } = router.query;

	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [wallMessage, setWallMessage] = useState("");

	function sendPost(){
		axios.post(
			`/api/workspace/${id}/wall/post`,
			{
				content: wallMessage
			}
		).then(() => {
			toast.success("Wall message posted!");
			setTimeout(() => {
				toast.loading("Refreshing wall...");
				router.reload();
			}, 1000);
		}).catch(error => {
			console.error(error);
			toast.error("Could not post wall message.");
			setTimeout(() => {
				toast.loading("Refreshing wall...");
				router.reload();
			}, 1000);
		});
	}

	return <div className="px-28 py-20">
		<Toaster position="bottom-center" />
		<p className="text-4xl font-bold mb-5">Wall</p>
		<textarea className="border border-[#AAAAAA] p-2.5 rounded-md w-full focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary focus-visible:outline-none placeholder-[#AAAAAA] resize-y h-16 " placeholder="Type your wall message here" onChange={(e) => setWallMessage(e.target.value)} value={wallMessage} />
		{!!wallMessage.length && <Button classoverride="mt-2" workspace onPress={sendPost}>Post</Button>}
		<div className="flex flex-col gap-2 mt-3">
			{posts.map((post: any) => (
				<div className="bg-white p-4 rounded-md" key={post.id}>
					<div className="flex">
						<img alt="avatar headshot" src={`https://www.roblox.com/headshot-thumbnail/image?userId=${post.authorId}&width=100&height=100&format=png`} className="rounded-full h-12 w-12 my-auto bg-primary" />
						<p className="font-semibold ml-2 break-normal leading-5 my-auto">
							{post.author.username}
							<br />
							<span className="text-gray-500/75 font-normal"> {moment(post.createdAt).format("DD MMM")} </span>
						</p>
					</div>
					<p className="pt-2 font-medium">{post.content}</p>
				</div>
			))}
		</div>
	</div>;
};

Settings.layout = Workspace;

export default Settings;
