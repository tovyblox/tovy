import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import Button from "@/components/button";
import Workspace from "@/layouts/workspace";
import { IconChevronRight } from "@tabler/icons";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";

const Home: pageWithLayout = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const router = useRouter();

	return <div className="px-28 py-20">
		<p className="text-4xl font-bold">Good morning, {login.displayname}</p>
		<button className="px-6 py-5 border-gray-300 bg-white rounded-md mt-3 w-full border-[1.4px] text-left hover:bg-gray-100 focus-visible:bg-gray-100 focus:outline-none"><p className="font-bold text-2xl leading-5 mt-1"> Host now <br /><span className="text-gray-400 font-normal text-base "> This workspace allows you to host unscheduled sessions   </span></p> </button>
		<p className="text-3xl font-medium mt-5">Ongoing sessions</p>
		<div className=" pt-5">
			<div className="bg-[url('https://tr.rbxcdn.com/4a3833e22d4523b58e173057a531a766/768/432/Image/Png')] w-full rounded-md overflow-clip">
				<div className="px-5 py-4 backdrop-blur flex">
					<div><p className="text-xl font-bold"> Training session </p>
						<div className="flex mt-1">
							<img src={login.thumbnail} className="bg-primary rounded-full w-8 h-8 my-auto" />
							<p className="font-semibold pl-2 leading-5 my-auto"> Hosted by ItsWHOOOP <br /> <span className="text-red-500"> Slocked </span> </p>
						</div>
					</div>
					<Button classoverride="my-auto ml-auto"> End </Button>
					<Button classoverride="my-auto ml-3 py-3 px-3"> <IconChevronRight size={22}/> </Button>
				</div>
			</div>
		</div>
		<p className="text-3xl font-medium mt-10">Manage</p>
		<div className="grid grid-cols-2 gap-5 mt-5">
			<button onClick={() => router.push(`/workspace/${router.query.id}/sessions/schedule`)} className="cardBtn"> <p className="text-2xl font-semibold leading-5 mt-2 text-left"> View schedule <br/> <span className="text-gray-400 font-normal text-base" > View this workspaces session schedule </span> </p> </button>
			<button className="cardBtn"> <p className="text-2xl font-semibold leading-5 mt-2 text-left"> View past sessions <br/> <span className="text-gray-400 font-normal text-base" > View this workspaces past sessions </span> </p> </button>  
		</div>
	</div>;
};

Home.layout = Workspace;

export default Home;
