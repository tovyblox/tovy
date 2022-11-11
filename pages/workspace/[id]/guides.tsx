import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import Button from "@/components/button";
import Workspace from "@/layouts/workspace";
import { IconChevronRight } from "@tabler/icons";
import { useRecoilState } from "recoil";
import { InferGetServerSidePropsType, GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import axios from "axios";
import prisma, { document } from "@/utils/database";


export const getServerSideProps = async (context: any) => {
	const { id } = context.query;
	if (!id) {
		return {
			notFound: true,
		};
	}
	const documents = await prisma.document.findMany({
		where: {
			workspaceGroupId: parseInt(id as string),
		},
		include: {
			owner: {
				select: {
					username: true,
					picture: true,
				}
			}
		}
	})
	return {
		props: {
			documents: (JSON.parse(JSON.stringify(documents)) as typeof documents)
		},
	}
}

type pageProps = {
	documents: (document & { owner: { username: string, picture: string } })[]
}
const Home: pageWithLayout<pageProps> = ({ documents }) => {
	const [login, setLogin] = useRecoilState(loginState);

	const router = useRouter();

	return <div className="px-28 py-20">
		<p className="text-4xl font-bold">Good morning, {login.displayname}</p>
		<button className="cardBtn mt-4" onClick={() => router.push(`/workspace/${router.query.id}/guides/new`)}><p className="font-bold text-2xl leading-5 mt-1"> New guide <br /><span className="text-gray-400 font-normal text-base "> Create a new guide for your group   </span></p> </button>
		<p className="text-3xl font-medium mt-5 mb-5">Guides</p>
		<div className="grid grid-cols-3 gap-5 mt-5">
			{documents.map((document) => (
				<div className="" key={document.id}>
					<div className="px-5 py-4 backdrop-blur flex cardBtn">
						<div><p className="text-xl font-bold"> {document.name} </p>
							<div className="flex mt-1">
								<img src={document.owner?.picture} className="bg-primary rounded-full w-8 h-8 my-auto" />
								<p className="font-semibold pl-2 leading-5 my-auto"> Created by {document.owner?.username} </p>
							</div>
						</div>
					</div>

				</div>
			))}
		</div>
		{!documents.length && (
			<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
				<img className="mx-auto my-auto h-full" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
				<p className="text-center text-xl font-semibold">No sessions are ongoing</p>

			</div>
		)}

	</div>;
};

Home.layout = Workspace;

export default Home;
