import type { NextPage } from "next";
import Head from "next/head";
import Topbar from "@/components/topbar";
import { useRouter } from "next/router";
import { loginState } from "@/state";
import Button from "@/components/button";
import Tooltip from "@/components/tooltip";
import { useRecoilState } from "recoil";

const Home: NextPage = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const router = useRouter();
	const gotoWorkspace = (id: number) => {
		router.push(`/workspace/${id}`);
	};

	return (
		<div>
			<Head>
				<title>Tovy</title>
			</Head>

			<div className="h-screen bg-gray-100 dark:bg-gray-700">
				<Topbar />
				<div className="lg:px-48 md:px-32 sm:px-20 xs:px-9 px-8 ">
					<div className=" pt-10 flex">
						<p className="my-auto text-2xl font-bold"> Select a Workspace </p>
						<div className="ml-auto">
							<Tooltip tooltipText="The ability to create new workspaces is coming soon, stay tuned" orientation="bottom">
								<Button disabled={true}>
									New Workspace
								</Button>
							</Tooltip>
						</div>
					</div>
					{login.workspaces && !!login.workspaces.length && <div className="grid grid-cols-1 pt-5 gap-x-9 lg:grid-cols-3 2xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
						{login.workspaces?.map((workspace, i) => (
							<div className=" rounded-xl h-48" key={i}>
								<div className={`bg-gray-500 rounded-t-xl h-24 bg-no-repeat bg-center bg-cover`} style={{ backgroundImage: `url(${workspace.groupThumbnail})` }} />
								<div className="h-14 bg-white dark:bg-gray-600 rounded-b-xl relative bottom-0 flex flex-row px-3">
									<p className="my-auto text-xl font-bold"> {workspace.groupName} </p>
									<Button classoverride="py-2 px-2 my-2" onPress={() => gotoWorkspace(workspace.groupId)}>
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
					}

					{login.workspaces && !login.workspaces.length && (
						<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
							<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
							<p className="text-center text-xl font-semibold">No workspaces available.</p>
						</div>
					)}

				</div>
			</div>
		</div>
	);
};

export default Home;
