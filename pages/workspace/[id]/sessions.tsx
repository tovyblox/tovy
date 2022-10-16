import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import Button from "@/components/button";
import Workspace from "@/layouts/workspace";
import { useRecoilState } from "recoil";

const Home: pageWithLayout = () => {
	const [login, setLogin] = useRecoilState(loginState);

	return <div className="px-28 py-20">
		<p className="text-4xl font-bold">Good morning, {login.displayname}</p>
		<button className="p-6 border-[#AAAAAA] bg-white rounded-md mt-3 w-full border-[1.4px] text-left hover:bg-gray-300 focus:bg-gray-300 "><p className="font-bold text-2xl leading-5 mt-1"> Host now <br/><span className="text-gray-400 font-normal text-base "> This workspace allows you to host unscheduled sessions   </span></p> </button>
		<p className="text-3xl font-medium mt-5">Pending</p>
		<div className="grid grid-cols-1 pt-5 gap-x-9 lg:grid-cols-3 2xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
			{login.workspaces.map((workspace, i) => (
				<div className=" rounded-xl h-48" key={i}>
					<div className={`bg-gray-500 rounded-t-xl h-24 bg-no-repeat bg-center bg-cover`} style={{ backgroundImage: `url(${workspace.groupThumbnail})` }} />
					<div className="h-14 bg-white dark:bg-gray-600 rounded-b-xl relative bottom-0 flex flex-row px-3">
						<p className="my-auto text-xl font-bold"> Tovy </p>
						<Button classoverride="py-2 px-2 my-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="icon icon-tabler icon-tabler-chevron-right"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
								<polyline points="9 6 15 12 9 18"></polyline>
							</svg>
						</Button>
					</div>
				</div>
			))}
		</div>
	</div>;
};

Home.layout = Workspace;

export default Home;
