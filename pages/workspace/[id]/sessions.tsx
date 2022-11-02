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
		<button className="cardBtn"><p className="font-bold text-2xl leading-5 mt-1"> Host now <br /><span className="text-gray-400 font-normal text-base "> This workspace allows you to host unscheduled sessions   </span></p> </button>
		<p className="text-3xl font-medium mt-5 mb-5">Ongoing sessions</p>
		{sessions.map(session => (
			<div className="">
				<div className="bg-[url('https://tr.rbxcdn.com/4a3833e22d4523b58e173057a531a766/768/432/Image/Png')] w-full rounded-md overflow-clip">
					<div className="px-5 py-4 backdrop-blur flex">
						<div><p className="text-xl font-bold"> Training session </p>
							<div className="flex mt-1">
								<img src={login.thumbnail} className="bg-primary rounded-full w-8 h-8 my-auto" />
								<p className="font-semibold pl-2 leading-5 my-auto"> Hosted by ItsWHOOOP <br /> <span className="text-red-500"> Slocked </span> </p>
							</div>
						</div>
						<Button classoverride="my-auto ml-auto"> End </Button>
						<Button classoverride="my-auto ml-3 py-3 px-3"> <IconChevronRight size={22} /> </Button>
					</div>
				</div>
			</div>
		))}
		{!sessions.length && (
			<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
				<img className="mx-auto my-auto h-full" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
				<p className="text-center text-xl font-semibold">No sessions are ongoing</p>

			</div>
		)}
		<p className="text-3xl font-medium mt-10">Manage</p>
		<div className="grid grid-cols-2 gap-5 mt-5">
			<button onClick={() => router.push(`/workspace/${router.query.id}/sessions/schedule`)} className="cardBtn"> <p className="text-2xl font-semibold leading-5 mt-2 text-left"> View schedule <br /> <span className="text-gray-400 font-normal text-base" > View this workspaces session schedule </span> </p> </button>
			<button className="cardBtn"> <p className="text-2xl font-semibold leading-5 mt-2 text-left"> View past sessions <br /> <span className="text-gray-400 font-normal text-base" > View this workspaces past sessions </span> </p> </button>
		</div>
	</div>;
};

Home.layout = Workspace;

export default Home;
