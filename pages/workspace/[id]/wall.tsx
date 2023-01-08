import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Workspace from "@/layouts/workspace";
import { useState } from "react";
import { useRecoilState } from "recoil";
import Button from "@/components/button";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import prisma from "@/utils/database"
import type { wallPost } from "@prisma/client";
import moment from "moment";
import { withSessionSsr } from "@/lib/withSession";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import axios from "axios";

export const getServerSideProps: GetServerSideProps = withPermissionCheckSsr(async ({ query, req }) => {

	const posts = await prisma.wallPost.findMany({
		where: {
			workspaceGroupId: parseInt(query.id as string)
		},
		orderBy: {
			createdAt: "desc"
		},
		include: {
			author: {
				select: {
					username: true,
					picture: true
				}
			}
		}
	});

	return {
		props: {
			posts: (JSON.parse(JSON.stringify(posts, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof posts)
		}
	}
});

type pageProps = {
	posts: wallPost[]
}
const Wall: pageWithLayout<pageProps> = (props) => {
	const router = useRouter();
	const { id } = router.query;

	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [wallMessage, setWallMessage] = useState("");
	const [posts, setPosts] = useState(props.posts);
	const [loading, setLoading] = useState(false);
	

	function sendPost(){
		setLoading(true);
		axios.post(
			`/api/workspace/${id}/wall/post`,
			{
				content: wallMessage
			}
		).then((req) => {
			toast.success("Wall message posted!");
			setWallMessage("");
			setPosts([req.data.post, ...posts]);
			setLoading(false);
		}).catch(error => {
			console.error(error);
			toast.error("Could not post wall message.");
			setLoading(false);
		});
	}

	return <div className="pagePadding">
		<Toaster position="bottom-center" />
		<p className="text-4xl font-bold mb-5">Wall</p>
		<textarea className="border border-[#AAAAAA] p-2.5 rounded-md w-full focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary focus-visible:outline-none placeholder-[#AAAAAA] resize-y h-16 " placeholder="Type your wall message here" onChange={(e) => setWallMessage(e.target.value)} value={wallMessage} />
		{!!wallMessage.length && <Button classoverride="mt-2" workspace onPress={sendPost} loading={loading}>Post</Button>}
		{posts.length < 1 && (
			<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5 mt-3">
				<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
				<p className="text-center text-xl font-semibold">There are no wall messages.</p>
			</div>
		)}
		<div className="flex flex-col gap-2 mt-3">
			{posts.map((post: any) => (
				<div className="bg-white p-4 rounded-md" key={post.id}>
					<div className="flex">
						<img alt="avatar headshot" src={post.author.picture} className="rounded-full h-12 w-12 my-auto bg-primary" />
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

Wall.layout = Workspace;

export default Wall;
