import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import axios from "axios";
import { useRouter } from "next/router";
import { useState, Fragment } from "react";
import { useRecoilState } from "recoil";
import toast, { Toaster } from 'react-hot-toast';
import Button from "@/components/button";
import { InferGetServerSidePropsType } from "next";
import { withSessionSsr } from "@/lib/withSession";
import moment from "moment";
import { Dialog, Transition } from "@headlessui/react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Input from "@/components/input";

type Form = {
	startTime: string;
	endTime: string;
	reason: string;
}

export const getServerSideProps = withSessionSsr(
	async ({ req, res, params }) => {
		const notices = await prisma.inactivityNotice.findMany({
			where: {
				userId: req.session.userid,
				workspaceGroupId: parseInt(params?.id as string),
			},
			orderBy: [
				{
					startTime: "desc"
				}
			]
		});

		console.log(notices)
		
		return {
			props: {
				notices: (JSON.parse(JSON.stringify(notices, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof notices)
			}
		}
	}
)

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Notices: pageWithLayout<pageProps> = ({ notices }) => {
	const router = useRouter();
	const { id } = router.query;
	
	const form = useForm<Form>();
	const { register, handleSubmit, setError } = form;

	const onSubmit: SubmitHandler<Form> = async ({ startTime, endTime, reason }) => {
		const axiosPromise = axios.post(
			`/api/workspace/${id}/activity/notices/create`,
			{ startTime: new Date(startTime).getTime(), endTime: new Date(endTime).getTime(), reason }
		);
		toast.promise(
			axiosPromise,
			{
				loading: "Creating your inactivity notice...",
				success: () => {
					setIsOpen(false);
					return "Inactivity notice submitted!";
				},
				error: "Inactivity notice was not created due to an unknown error."
			}
		);
	}

	const [login, setLogin] = useRecoilState(loginState);
	const [isOpen, setIsOpen] = useState(false);

	return <>
		<Toaster position="bottom-center" />

		<div className="px-28 py-20 space-y-4">
			<p className="text-4xl font-bold">Good morning, {login.displayname}</p>

			<button className="cardBtn" onClick={() => setIsOpen(true)}>
				<p className="font-bold text-2xl leading-5 mt-1">Create inactivity notice</p>
				<p className="text-gray-400 font-normal text-base mt-1">Inactivity notices show higher-ups that you are not active.</p>
			</button>
			<p className="text-3xl font-bold !mt-8 !mb-4">My past notices</p>
			<div className="grid gap-1 grid-cols-3">
				{notices.map((notice) => (
					<div className="bg-white p-4 rounded-md" key={notice.id}>
						<h2 className="text-lg font-semibold">
							{moment(new Date(notice.startTime)).format("MMM Do YYYY")} - {moment(new Date(notice.endTime as Date)).format("MMM Do YYYY")}
						</h2>
						<p className="text-gray-500">{notice.reason}</p>
						<p
							className={`${notice.reviewed ? notice.approved ? `text-green-600` : `text-red-600` : `text-amber-600`} font-semibold`}
						>
							{notice.reviewed ? notice.approved ? `Approved` : `Declined` : `Under review`}
						</p>
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
								<Dialog.Title as="p" className="my-auto text-2xl font-bold">Create notice</Dialog.Title>

								<div className="mt-2">
									<FormProvider {...form}>
										<form onSubmit={handleSubmit(onSubmit)}>
											<div className="grid gap-3 grid-cols-2">
												<Input label="Start Time" type="date" id="startTime" {...register("startTime", { required: { value: true, message: "This field is required" } })} />
												<Input label="End Time" type="date" id="endTime" {...register("endTime", { required: { value: true, message: "This field is required" } })} />
											</div>
											<Input label="Reason" type="text" id="reason" {...register("reason", { required: { value: true, message: "This field is required" } })} />
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