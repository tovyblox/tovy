import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import toast, { Toaster } from 'react-hot-toast';
import Button from "@/components/button";
import { InferGetServerSidePropsType } from "next";
import { withSessionSsr } from "@/lib/withSession";
import Input from "@/components/input";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { PrismaClient } from "@prisma/client";

type Form = {
	startTime: string;
	endTime: string;
	reason: string;
}

const Views: pageWithLayout = () => {
	const router = useRouter();
	const form = useForm<Form>();
	const { id } = router.query;

	const { register, handleSubmit, setError } = form;

	const [login, setLogin] = useRecoilState(loginState);

	const onSubmit: SubmitHandler<Form> = async ({ startTime, endTime, reason }) => {
		const axiosPromise = axios.post(
			`/api/workspace/${id}/activity/notices/create`,
			{ startTime: new Date(startTime).getTime(), endTime: new Date(endTime).getTime(), reason }
		);
		toast.promise(
			axiosPromise,
			{
				loading: "Creating your inactivity notice...",
				success: <b>Inactivity notice submitted!</b>,
				error: <b>Inactivity notice was not created due to an unknown error.</b>
			}
		);
	}

	return <div className="px-28 py-20 space-y-4">
		<p className="text-4xl font-bold">Good morning, {login.displayname}</p>

		<p className="text-3xl font-bold !mt-8 !mb-4">Inactivity notice creation</p>
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

		<Button onPress={handleSubmit(onSubmit)}>Submit notice</Button>
		<Toaster position="bottom-center" />
	</div>;
}

Views.layout = workspace

export default Views