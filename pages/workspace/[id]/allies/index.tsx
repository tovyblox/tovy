import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import axios from "axios";
import { useRouter } from "next/router";
import { getConfig } from "@/utils/configEngine";
import { useState, Fragment, useMemo, useRef } from "react";
import randomText from "@/utils/randomText";
import { useRecoilState } from "recoil";
import toast, { Toaster } from 'react-hot-toast';
import Button from "@/components/button";
import { InferGetServerSidePropsType } from "next";
import { withSessionSsr } from "@/lib/withSession";
import moment from "moment";
import { Dialog, Transition } from "@headlessui/react";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Input from "@/components/input";
import prisma, { inactivityNotice } from "@/utils/database";
import { getUsername, getThumbnail } from "@/utils/userinfoEngine";
import Image from 'next/image'
import Checkbox from "@/components/checkbox";
import Tooltip from "@/components/tooltip";

type Form = {
	group: string;
	notes: string;

}

export const getServerSideProps = withPermissionCheckSsr(
	async ({ req, res, params }) => {
		let users = await prisma.user.findMany({
			where: {
				OR: [
					{
						roles: {
							some: {
								workspaceGroupId: parseInt(params?.id as string),
								permissions: {
									has: 'admin'
								}
							}
						}
					},
					{
						roles: {
							some: {
								workspaceGroupId: parseInt(params?.id as string),
								permissions: {
									has: 'represent_alliance'
								}
							}
						}
					},
					{
						roles: {
							some: {
								workspaceGroupId: parseInt(params?.id as string),
								permissions: {
									has: 'manage_alliances'
								}
							}
						}
					}
				]
			}
		});
		const infoUsers: any = await Promise.all(users.map(async (user: any) => {
			return {
				...user,
				userid: Number(user.userid),
				thumbnail: await getThumbnail(user.userid)
			}
		}))

		const allies: any = await prisma.ally.findMany({
			where: {
				workspaceGroupId: parseInt(params?.id as string)
			},
			include: {
				reps: true
			}
		})
		const infoAllies = await Promise.all(allies.map(async (ally: any) => {
			const infoReps = await Promise.all(ally.reps.map(async (rep: any) => {
				return {
					...rep,
					userid: Number(rep.userid),
					username: await getUsername(rep.userid),
					thumbnail: await getThumbnail(rep.userid)
				}
			}))

			return {
				...ally,
				reps: infoReps
			}

		}))

		return {
			props: {
				infoUsers,
				infoAllies
			}
		}
	},'manage_alliances')

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Allies: pageWithLayout<pageProps> = (props) => {
	const router = useRouter();
	const { id } = router.query;
	const [selectedRoles, setSelectedRoles] = useState<string[]>([])
	const [login, setLogin] = useRecoilState(loginState);
	const text = useMemo(() => randomText(login.displayname), []);

	const form = useForm<Form>();
	const { register, handleSubmit, setError, watch } = form;

	const toggleRole = async (role: string) => {
		const roles = selectedRoles;
		if (roles.includes(role)) {
			roles.splice(roles.indexOf(role), 1);
		}
		else {
			roles.push(role);
		}
		setSelectedRoles(roles);
	}

	const [reps, setReps] = useState([])

	const handleCheckboxChange = (event: any) => {
		const { value, checked } = event.target
		if(checked) {
			// @ts-ignore
			setReps([...reps, value])
		} else {
			setReps(reps.filter((r) => r !== value))
		}
	}

	const onSubmit: SubmitHandler<Form> = async ({ group, notes }) => {

		const axiosPromise = axios.post(
			`/api/workspace/${id}/allies/new`,
			{ groupId: group, notes: notes, reps: reps }
		).then(req => {
		});
		toast.promise(
			axiosPromise,
			{
				loading: "Creating ally...",
				success: () => {
					setIsOpen(false);
					router.reload()
					return "Ally created!";
				},
				error: "Ally was not created due to an unknown error."
			}
		);
	}

	const [isOpen, setIsOpen] = useState(false);

	const colors = [
		'bg-red-500',
		'bg-yellow-500',
		'bg-green-500',
		'bg-blue-500',
		'bg-indigo-500',
		'bg-purple-500',
		'bg-pink-500',
	]

	const getRandomColor = () => {
		return colors[Math.floor(Math.random() * colors.length)];
	}

	const allies: any = props.infoAllies
	const users: any = props.infoUsers

	return <>
		<Toaster position="bottom-center" />

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
								<Dialog.Title as="p" className="my-auto text-2xl font-bold">Create ally</Dialog.Title>

								<div className="mt-2">
									<FormProvider {...form}>
										
										<form onSubmit={handleSubmit(onSubmit)}>
											<Input label="Group ID" type="number" {...register("group")} />
											<Input textarea label="Notes" {...register("notes")} />
											{users.length < 1 && <p className="text-gray-500">You don't have anyone who can represent yet</p>}
											{users.length >= 1 && <p className="text-gray-500 mb-4">{reps.length} Reps Chosen (Minimum 1)</p>}
											<div className="p-2 max-h-64 overflow-auto flex flex-col gap-4">
												{users.map((user: any) => {
													return (<div className="flex gap-4 items-center" key={user.userid}>
														<Checkbox value={user.userid} onChange={handleCheckboxChange} />
														<img src={user.thumbnail} className="w-10 h-10 rounded-full bg-primary"></img>
														<p>{user.username}</p>
													</div>)
												})}
											</div>
											<input type="submit" className="hidden" />
										</form>
									</FormProvider>
								</div>

								<div className="mt-4 flex">
									<Button classoverride="bg-red-500 hover:bg-red-300 ml-0" onPress={() => setIsOpen(false)}> Cancel </Button>
									<Button classoverride="" onPress={handleSubmit(onSubmit)}> Submit </Button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>

		<div className="pagePadding space-y-4">
			<p className="text-4xl font-bold">{text}</p>

			<button className="cardBtn" onClick={() => setIsOpen(true)}>
				<p className="font-bold text-2xl leading-5 mt-1">Create new ally</p>
				<p className="text-gray-400 font-normal text-base mt-1">Allies allow you to easily manage your relations with other groups</p>
			</button>

			<p className="text-3xl font-bold !mt-8 !mb-4">Your allies</p>

			{allies.length < 1 && <p>You haven't created any allies yet, why not make one now?</p>}
			
			<div className="grid gap-1 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
			{allies.map((ally: any) => (
					<div className="bg-white p-4 rounded-md ring-1 ring-gray-300" key={ally.id}>
						<div className="flex flex-row flex-wrap gap-4 items-center">
							<img src={ally.icon} className="w-12 h-12 rounded-full" />
							<h2 className="text-lg font-semibold">
								{ally.name}
							</h2>
						</div>
						
						<div className="flex flex-row flex-wrap mt-4 ml-[15px]">
							{ally.reps.map((rep: any) => {
								return (<div className="ml-[-15px]" key={rep.userid}>
								<Tooltip orientation="top" tooltipText={rep.username}>
									<img src={rep.thumbnail} className="w-12 h-12 rounded-full bg-primary z-0 hover:z-50 hover:shadow-xl border-4 border-white"></img>
								</Tooltip>
							</div>)
							})}
						</div>
						<div className="flex flex-row space-x-2 mb-0">
							<Button classoverride="bg-red-600 hover:bg-red-300" compact onClick={() => {
								const axiosPromise = axios.delete(`/api/workspace/${id}/allies/${ally.id}/delete`).then(req => {
									
								});
								toast.promise(
									axiosPromise,
									{
										loading: "Deleting ally...",
										success: () => {
											router.reload()
											return "Ally deleted!";
										},
										error: "Ally was not deleted due to an unknown error."
									}
								);
							}}> Delete </Button>
							<Button classoverride="bg-amber-600 hover:bg-amber-300" compact onClick={() => router.push(`/workspace/${id}/allies/manage/${ally.id}`)}>Manage</Button>
						</div>
					</div>
				))}
			</div>
		</div>

	</>;
}

Allies.layout = workspace

export default Allies