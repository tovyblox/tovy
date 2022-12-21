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
import { withPermissionCheckSsr  } from "@/utils/permissionsManager";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Input from "@/components/input";
import prisma, { inactivityNotice } from "@/utils/database";

type Form = {
	startTime: string;
	endTime: string;
	reason: string;
}

export const getServerSideProps = withPermissionCheckSsr(
	async ({ req, res, params }) => {
		const notices: inactivityNotice[] = await prisma.inactivityNotice.findMany({
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

		
		return {
			props: {
				notices: (JSON.parse(JSON.stringify(notices, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof notices)
			}
		}
	}
)

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Notices: pageWithLayout<pageProps> = (props) => {
	const router = useRouter();
	const { id } = router.query;
	const [notices, setNotices] = useState<inactivityNotice[]>(props.notices as inactivityNotice[]);
	const [login, setLogin] = useRecoilState(loginState);
	const text = useMemo(() => randomText(login.displayname), []);
	
	const form = useForm<Form>();
	const { register, handleSubmit, setError } = form;

	const onSubmit: SubmitHandler<Form> = async ({ startTime, endTime, reason }) => {
		const start = new Date();
		const end = new Date();
		start.setDate(parseInt(startTime.split("-")[2]));
		start.setMonth(parseInt(startTime.split("-")[1]) - 1);
		start.setFullYear(parseInt(startTime.split("-")[0]));
		end.setDate(parseInt(endTime.split("-")[2]));
		end.setMonth(parseInt(endTime.split("-")[1]) - 1);
		end.setFullYear(parseInt(endTime.split("-")[0]));

		const axiosPromise = axios.post(
			`/api/workspace/${id}/activity/notices/create`,
			{ startTime: start.getTime(), endTime: end.getTime(), reason }
		).then(req => {
			setNotices([...notices, req.data.notice])
		});
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

	const [isOpen, setIsOpen] = useState(false);

	return <>
		<Toaster position="bottom-center" />

		<div className="pagePadding space-y-4">
			<p className="text-4xl font-bold">{text}</p>

			<button className="cardBtn" onClick={() => setIsOpen(true)}>
				<p className="font-bold text-2xl leading-5 mt-1">Create inactivity notice</p>
				<p className="text-gray-400 font-normal text-base mt-1">Inactivity notices show higher-ups that you are not active.</p>
			</button>
			{notices.filter(x => !x.reviewed).length > 0 && (
				<div>
					<p className="text-3xl font-bold !mt-8 !mb-4">Notices under review</p>
					<div className="grid gap-1 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
						{notices.filter(x => !x.reviewed).map((notice: any) => (
							<div className="bg-white p-4 rounded-md ring-1 ring-gray-300" key={notice.id}>
								<h2 className="text-lg font-semibold">
									{moment(new Date(notice.startTime)).format("MMM Do YYYY")} - {moment(new Date(notice.endTime as Date)).format("MMM Do YYYY")}
								</h2>
								<p className="text-gray-500">{notice.reason}</p>
								<p
									className={`text-amber-600 font-semibold`}
								>
									Under review
								</p>
							</div>
						))}
					</div>
				</div>
			)}
			<p className="text-3xl font-bold !mt-8 !mb-4">My past notices</p>
			{notices.length < 1 && (
				<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
					<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
					<p className="text-center text-xl font-semibold">You have no past notices.</p>
				</div>
			)}
			<div className="grid gap-1 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				{notices.filter(x => x.reviewed).map((notice: any) => (
					<div className="bg-white p-4 rounded-md ring-1 ring-gray-300" key={notice.id}>
						<h2 className="text-lg font-semibold">
							{moment(new Date(notice.startTime)).format("MMM Do YYYY")} - {moment(new Date(notice.endTime as Date)).format("MMM Do YYYY")}
						</h2>
						<p className="text-gray-500">{notice.reason}</p>
						<p
							className={`${notice.approved ? `text-green-600` : `text-red-600`} font-semibold`}
						>
							{notice.approved ? `Approved` : `Declined`}
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
												<Input label="Start Time" type="date" id="startTime" {...register("startTime", { required: { value: true, message: "This field is required" }, validate: {
													mm: (value) => {
														const date = new Date();
														date.setMilliseconds(0);
														date.setSeconds(0);
														date.setMinutes(0);
														date.setHours(0);
														date.setDate(parseInt(value.split("-")[2]));
														date.setMonth(parseInt(value.split("-")[1]) - 1);
														date.setFullYear(parseInt(value.split("-")[0]));

														if (date.getTime() < new Date().getTime()) return "Please select a date in the future";
													}
												} })} />
												<Input label="End Time" type="date" id="endTime" {...register("endTime", { required: { value: true, message: "This field is required" }, validate: {
													mn: (value) => {
														if (new Date(value).getTime() < new Date(form.getValues().startTime).getTime()) return "Please select a date greater than the start date";
													}
												}})} />
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