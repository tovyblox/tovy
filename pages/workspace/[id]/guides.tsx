import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import Button from "@/components/button";
import Workspace from "@/layouts/workspace";
import { IconChevronRight } from "@tabler/icons";
import { useRecoilState } from "recoil";
import { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { useRouter } from "next/router";
import axios from "axios";


export const getServerSideProps = async () => {
	const sessions = await prisma.session.findMany({
		where: {
			startedAt: {
				not: null
			},
			ended: null
		}
	});
	console.log(sessions)
	return {
		props: {
			sessions: (JSON.parse(JSON.stringify(sessions)) as typeof sessions)
		},
	}
}

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Home: pageWithLayout<pageProps> = ({ sessions }) => {
	const [login, setLogin] = useRecoilState(loginState);

	const router = useRouter();

	const endSession = async (id: string) => {
		await axios.post(`/api/workspace/${router.query.id}/sessions/manage/${id}/end`, {});
		sessions.splice(sessions.findIndex(s => s.id === id), 1);
	}
		


	return <div className="px-28 py-20">
		<p className="text-4xl font-bold">Good morning, {login.displayname}</p>
		<button className="cardBtn mt-4"><p className="font-bold text-2xl leading-5 mt-1"> New guide <br /><span className="text-gray-400 font-normal text-base "> Create a new guide for your group   </span></p> </button>
		<p className="text-3xl font-medium mt-5 mb-5">Guides</p>
		<div className="grid grid-cols-3 gap-5 mt-5">
		<div className="" >
				<div className="bg-white outline-gray-300 outline outline-1 w-full rounded-md overflow-clip">
					<div className="px-5 py-4 backdrop-blur flex">
						<div><p className="text-xl font-bold"> Training guide </p>
							<div className="flex mt-1">
								<img src={login.thumbnail} className="bg-primary rounded-full w-8 h-8 my-auto" />
								<p className="font-semibold pl-2 leading-5 my-auto"> Created by ItsWHOOOP </p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		{!sessions.length && (
			<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
				<img className="mx-auto my-auto h-full" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
				<p className="text-center text-xl font-semibold">No sessions are ongoing</p>

			</div>
		)}
		
	</div>;
};

Home.layout = Workspace;

export default Home;
