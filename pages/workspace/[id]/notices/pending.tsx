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
import prisma, { inactivityNotice, user } from "@/utils/database";

type Form = {
	startTime: string;
	endTime: string;
	reason: string;
}

export const getServerSideProps = withPermissionCheckSsr(
	async ({ req, res, params }) => {
		const notices = await prisma.inactivityNotice.findMany({
			where: {
				workspaceGroupId: parseInt(params?.id as string),
				reviewed: false
			},
			orderBy: [
				{
					startTime: "desc"
				}
			],
			include: {
				user: true
			}

		});


		return {
			props: {
				notices: (JSON.parse(JSON.stringify(notices, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof notices)
			}
		}
	}, 'manage_activity'
)

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Notices: pageWithLayout<pageProps> = (props) => {
	const router = useRouter();
	const { id } = router.query;
	const [notices, setNotices] = useState<(inactivityNotice & {
		user: user;
	})[]>(props.notices as (inactivityNotice & {
		user: user;
	})[]);
	const [login, setLogin] = useRecoilState(loginState);
	const text = useMemo(() => randomText(login.displayname), []);

	const [isOpen, setIsOpen] = useState(false);

	const updateNotice = async (notice: inactivityNotice & {
		user: user;
		}, status: string) => {
		const req = axios.post(`/api/workspace/${id}/activity/notices/update`, {
			id: notice.id,
			status
		}).then(res => {
			if (res.data.success) {
				setNotices(notices.filter(n => n.id !== notice.id));
			}
		});
		toast.promise(req, {
			loading: "Updating notice...",
			success: "Notice updated!",
			error: "Failed to update notice"
		});
	}

	return <>
		<Toaster position="bottom-center" />

		<div className="pagePadding space-y-4">
			<p className="text-4xl font-bold">{text}</p>
			<p className="text-3xl font-bold !mt-8 !mb-4">Pending notices</p>
			{notices.length < 1 && (
				<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5">
					<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
					<p className="text-center text-xl font-semibold">There are no pending notices.</p>
				</div>
			)}
			<div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				{notices.map((notice: any) => (
					<div className="bg-white p-4 rounded-md ring-1 ring-gray-300" key={notice.id}>
						<h2 className="text-lg font-semibold">
							{moment(new Date(notice.startTime)).format("MMM Do YYYY")} - {moment(new Date(notice.endTime as Date)).format("MMM Do YYYY")}
						</h2>
						<div className="flex mt-1">
							<img src={notice.user?.picture} className="bg-primary rounded-full w-8 h-8 my-auto" />
							<p className="font-semibold pl-2 leading-5 my-auto"> Created by {notice.user?.username} </p>
						</div>
						<p className="text-gray-500">{notice.reason}</p>
						<div> 
							<Button compact onClick={() => updateNotice(notice, 'approve')}> Approve </Button>
							<Button compact onClick={() => updateNotice(notice, 'deny')} classoverride="bg-red-600 hover:bg-red-300 focus-visible:bg-red-300 ml-2"> Deny </Button>
						</div>
					</div>
				))}
			</div>
		</div>
	</>;
}

Notices.layout = workspace

export default Notices