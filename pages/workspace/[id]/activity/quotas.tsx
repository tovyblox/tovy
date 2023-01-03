import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import axios from "axios";
import { useRouter } from "next/router";
import { useState, Fragment, useMemo } from "react";
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

type Form = {
	type: string;
	requirement: number;
	name: string;

}

export const getServerSideProps = withPermissionCheckSsr(
	async ({ req, res, params }) => {




		const quotas = await prisma.quota.findMany({
			where: {
				workspaceGroupId: parseInt(params?.id as string)
			},
			include: {
				assignedRoles: true
			}
		});

		const roles = await prisma.role.findMany({
			where: {
				workspaceGroupId: Number(params?.id),
				isOwnerRole: false
			},
		});

		return {
			props: {
				quotas,
				roles
			}
		}
	}, 'manage_activity'
)

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Notices: pageWithLayout<pageProps> = (props) => {
	const router = useRouter();
	const { id } = router.query;
	const [quotas, setQuotas] = useState<inactivityNotice[]>(props.quotas as inactivityNotice[]);
	const [selectedRoles, setSelectedRoles] = useState<string[]>([])
	const roles: any = props.roles
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

	const onSubmit: SubmitHandler<Form> = async ({ type, requirement, name }) => {

		const axiosPromise = axios.post(
			`/api/workspace/${id}/activity/quotas/new`,
			{ value: Number(requirement), type, roles: selectedRoles, name }
		).then(req => {

		});
		toast.promise(
			axiosPromise,
			{
				loading: "Creating your quota...",
				success: () => {
					router.reload()
					return "Quota created!";
				},
				error: "Quota was not created due to an unknown error."
			}
		);
	}

	const [isOpen, setIsOpen] = useState(false);

	const types: {
		[key: string]: string;
	} = {
		'mins': 'Minutes in game',
		'sessions_hosted': 'sessions hosted',
		'sessions_attended': 'sessions attended',

	}

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

	return <>
		<Toaster position="bottom-center" />

		<div className="pagePadding space-y-4">
			<p className="text-4xl font-bold">{text}</p>

			<button className="cardBtn" onClick={() => setIsOpen(true)}>
				<p className="font-bold text-2xl leading-5 mt-1">Create new quota</p>
				<p className="text-gray-400 font-normal text-base mt-1">Quotas are a way to set requirements for your staff!.</p>
			</button>

			<p className="text-3xl font-bold !mt-8 !mb-4">Existing quotas</p>
			{quotas.length < 1 && (
				<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
					<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
					<p className="text-center text-xl font-semibold">There are not quotas setup! Why don't you add one?</p>
				</div>
			)}
			<div className="grid gap-1 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				{quotas.map((notice: any) => (
					<div className="bg-white p-4 rounded-md ring-1 ring-gray-300" key={notice.id}>
						<h2 className="text-lg font-semibold">
							{notice.name}
						</h2>
						<p
							className={`font-semibold`}
						>
							{notice.value} {types[notice.type]} per timeframe
						</p>
						<div className="flex flex-row space-x-2 mt-2">
							{notice.assignedRoles.map((role: any) => (
								<div key={role.id} className={`flex flex-row items-center space-x-1 ${getRandomColor()} py-1 px-3 rounded-full `}>
									<p className="text-sm">{role.name}</p>
								</div>
							))}
						</div>
						<div className="flex flex-row space-x-2 mt-2">
							<Button classoverride="bg-red-600 hover:bg-red-300" compact onClick={() => {
								const axiosPromise = axios.delete(`/api/workspace/${id}/activity/quotas/${notice.id}/delete`).then(req => {
									setQuotas(quotas.filter((q: any) => q.id !== notice.id));
								});
								toast.promise(
									axiosPromise,
									{
										loading: "Deleting your quota...",
										success: () => {
											return "Quota deleted!";
										},
										error: "Quota was not deleted due to an unknown error."
									}
								);
							}}> Delete </Button>
						</div>
					</div>
				))}
			</div>
		</div>

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
								<Dialog.Title as="p" className="my-auto text-2xl font-bold">Create quota</Dialog.Title>

								<div className="mt-2">
									<FormProvider {...form}>
										<p className="text-gray-500">Assigned to</p>
										{roles.map((role: any) => (
											<div
												className="flex items-center"
												key={role.id}
											>
												<input
													type="checkbox"
													onChange={() => toggleRole(role.id)}

													className="rounded-sm mr-2 w-4 h-4 transform transition text-primary bg-slate-100 border-gray-300 hover:bg-gray-300 focus-visible:bg-gray-300 checked:hover:bg-primary/75 checked:focus-visible:bg-primary/75 focus:ring-0"
												/>
												<p>{role.name}</p>
											</div>
										))}
										<p className="text-gray-500 mt-2">Quota type</p>
										<form onSubmit={handleSubmit(onSubmit)}>
											<select  {...register('type')} className={"text-gray-600 dark:text-white rounded-lg p-2 mb-2 border-2 border-gray-300  dark:border-gray-500 w-full bg-gray-50 focus-visible:outline-none dark:bg-gray-700 focus-visible:ring-tovybg focus-visible:border-tovybg"}>
												<option value='sessions_hosted'>Sessions Hosted</option>
												<option value='sessions_attended'>Sessions Slots Claimed</option>
												<option value='mins'>Minutes in game</option>
											</select>
											<Input label="Requirement" type="number" append={watch('type') === 'mins' ? 'Miniutes in game' : 'Sessions'} {...register("requirement")} />
											<Input label="Name" {...register("name")} />
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
	</>;
}

Notices.layout = workspace

export default Notices