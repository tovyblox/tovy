import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import { loginState } from "@/state";
import { getDisplayName, getUsername, getThumbnail } from "@/utils/userinfoEngine";
import { ActivitySession } from "@prisma/client";
import prisma from "@/utils/database";
import { useRecoilState } from "recoil";
import { useMemo, useRef, useState } from "react";
import randomText from "@/utils/randomText";
import FormList from "@/components/forms/FormList";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import Button from "@/components/button";
import Input from "@/components/input";
import Switchcomponenet from "@/components/switch";
import { Tab } from "@headlessui/react";

export const getServerSideProps = withPermissionCheckSsr(
	async ({ query, req }) => {
		return {
			props: {}
		}
	}
)

const types: string[] = [
	"Long text",
	"Short text",
	"Number",
	"Checkbox",
	"Radio",
	"Scale"
]

type pageProps = {}
const Create: pageWithLayout<pageProps> = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const text = useMemo(() => randomText(login.displayname), []);
	
	const router = useRouter();
	const { id } = router.query;

	const methods = useForm();
	const [signIn, setSignIn] = useState(false);
	const onSubmit = (data: any) => {
		console.log(data)
	}

	return <div className="pagePadding space-y-6">
		<div className="bg-white p-4 rounded-md border">
			<p className="text-3xl font-bold">Tovy Support</p>
			<p className="text-xl text-gray-500">Provide assistance and support to customers or clients.</p>
		</div>
		<Tab.Group>
			<Tab.List className="flex py-1 space-x-4 !mt-2">
				<Tab className={({ selected }) =>
					`w-full text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Questions
				</Tab>
				<Tab className={({ selected }) =>
					`w-full text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Automation
				</Tab>
				<Tab className={({ selected }) =>
					`w-full text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Settings
				</Tab>
			</Tab.List>
			<Tab.Panels className="!mt-1">
				<Tab.Panel>
					<button className="cardBtn mb-4">
						<p className="font-bold text-2xl leading-5 mt-1">New question</p>
						<p className="text-gray-400 font-normal text-base mt-1">Add a new question to your form.</p>
					</button>
					<div className="grid grid-cols-1 gap-y-2">
						<div className="bg-white p-4 rounded-md border">
							<div className="grid grid-cols-3 gap-2">
								<input
									className="col-span-2 text-gray-600 dark:text-white rounded-lg p-2 border-2 border-gray-300 dark:border-gray-500 w-full bg-gray-50 focus-visible:outline-none dark:bg-gray-700 focus-visible:ring-blue-500 focus-visible:border-blue-500"
									type="text"
									placeholder="Question"
								/>
								<select className={"text-gray-600 dark:text-white rounded-lg p-2 border-2 border-gray-300  dark:border-gray-500 w-full bg-gray-50 focus-visible:outline-none dark:bg-gray-700 focus-visible:ring-tovybg focus-visible:border-tovybg"}>
									{types.map((type) => (
										<option value={type} key={type}>{type}</option>
									))}
								</select>
							</div>
							<textarea
								className="mt-2 disabled:opacity-80 disabled:cursor-not-allowed text-gray-600 dark:text-white rounded-lg p-2 border-2 border-gray-300 dark:border-gray-500 w-full bg-gray-50 focus-visible:outline-none dark:bg-gray-700 focus-visible:ring-blue-500 focus-visible:border-blue-500"
								placeholder="Long answer text"
								disabled
							/>
						</div>
					</div>
				</Tab.Panel>
				<Tab.Panel>
					<p>automation</p>
				</Tab.Panel>
				<Tab.Panel>
					<FormProvider {...methods}>
						<div className="grid grid-cols-1">
							<div className="bg-white p-4 border border-1 border-gray-300 rounded-md">
								<p className="text-2xl font-bold mb-1">Information</p>
								<Input {...methods.register("name", { required: { value: true, message: "Field required" } })} label="Title" />
								<Input {...methods.register("name", { required: { value: true, message: "Field required" } })} label="Description" />
							</div>
						</div>
					</FormProvider>
				</Tab.Panel>
			</Tab.Panels>
		</Tab.Group>
		<div className="mt-2">
			<Button classoverride="w-full" onPress={methods.handleSubmit(onSubmit)}>Create form</Button>
		</div>
	</div>;
}

Create.layout = workspace

export default Create