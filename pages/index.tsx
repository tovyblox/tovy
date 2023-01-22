import type { NextPage } from "next";
import Head from "next/head";
import Topbar from "@/components/topbar";
import { useRouter } from "next/router";
import { loginState } from "@/state";
import { Transition, Dialog } from "@headlessui/react";
import { useState, Fragment } from "react";
import Button from "@/components/button";
import axios from "axios";
import Input from "@/components/input";
import Tooltip from "@/components/tooltip";
import { Toast, Toaster } from "react-hot-toast";
import { useForm, FormProvider } from "react-hook-form";
import { useRecoilState } from "recoil";
import { toast } from "react-hot-toast";

const Home: NextPage = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const [loading, setLoading] = useState(false);
	const methods = useForm();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const gotoWorkspace = (id: number) => {
		router.push(`/workspace/${id}`);
	};
	
	const createWorkspace = async () => {
		setLoading(true);
		const t = toast.loading("Creating workspace...");
		const request = await axios.post("/api/createws", {
			groupId: Number(methods.getValues("groupID")),
		}).catch((err) => {
			console.log(err);
			setLoading(false);
			if (err.response.data.error === "You are not a high enough rank") {
				methods.setError("groupID", {
					type: 'custom',
					message: 'You need to be a rank 10 or higher to create a workspace'
				});
			}
			if (err.response.data.error === "Workspace already exists") {
				methods.setError("groupID", {
					type: 'custom',
					message: 'This group already has a workspace'
				});
			}
		});

		

		if (request) {
			toast.success("Workspace created!", {
				id: t
			});
			setIsOpen(false);
			router.push(`/workspace/${methods.getValues("groupID")}?new=true`);
		}
	}

	const checkRoles = async () => {
		const request = axios.post('/api/auth/checkRoles', {}).then((res) => {
			router.reload();
		}).catch((err) => {
			console.log(err);
		})

		toast.promise(request, {
			loading: 'Checking roles...',
			success: 'Roles checked!',
			error: 'An error occured'
		})
	}

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
							<Button  onClick={() => setIsOpen(true)}>
								New Workspace
							</Button>
							<Button onClick={() => checkRoles()}> 
								Check roles
							</Button>
						</div>
					</div>
					{login.workspaces && !!login.workspaces.length && <div className="grid grid-cols-1 pt-5 gap-x-9 lg:grid-cols-3 2xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 mt-2">
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

					<Toaster />

					<Transition appear show={isOpen} as={Fragment}>
						<Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0"
								enterTo="opacity-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<div className="fixed inset-0 bg-black bg-opacity-25" />
							</Transition.Child>

							<div className="fixed inset-0 overflow-y-auto">
								<div className="flex min-h-full items-center justify-center p-4 text-center">
									<Transition.Child
										as={Fragment}
										enter="ease-out duration-300"
										enterFrom="opacity-0 scale-95"
										enterTo="opacity-100 scale-100"
										leave="ease-in duration-200"
										leaveFrom="opacity-100 scale-100"
										leaveTo="opacity-0 scale-95"
									>
										<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
											<Dialog.Title
												as="p"
												className="my-auto text-2xl font-bold"
											>
												New Workspace
											</Dialog.Title>
											<div className="mt-2">
												<form onSubmit={methods.handleSubmit(createWorkspace)}>
													<FormProvider {...methods}>
														<Input label="Group ID" placeholder="532"  {...methods.register('groupID', { required: {value: true, message: 'This field is required'}, pattern: { value: /^[a-zA-Z0-9-.]*$/, message: 'No spaces or special charactars' }, maxLength: { value: 10, message: 'Length must be below 10 charactars`' } })} />
													</FormProvider>
												</form>
											</div>

											<div className="mt-4 flex">
												<Button classoverride="bg-red-500 hover:bg-red-300 ml-0" onPress={() => setIsOpen(false)} loading={loading}> Cancel </Button>
												<Button classoverride="" onPress={methods.handleSubmit(createWorkspace)} loading={loading}> Create </Button>

											</div>
										</Dialog.Panel>
									</Transition.Child>
								</div>
							</div>
						</Dialog>
					</Transition>
				</div>
			</div>
		</div>
	);
};

export default Home;
