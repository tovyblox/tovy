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

export const getServerSideProps = withPermissionCheckSsr(
	async ({ query, req }) => {
		return {
			props: {}
		}
	}
)

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
		<p className="text-4xl font-bold">{text}</p>
		<FormProvider {...methods}>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
				<div className="bg-white p-4 border border-1 border-gray-300 rounded-md">
					<p className="text-2xl font-bold mb-1">Information</p>
					<Input {...methods.register("name", { required: { value: true, message: "Field required" } })} label="Form Title" />
				</div>
				<div className="bg-white p-4 border border-1 border-gray-300 rounded-md">
					<p className="text-2xl font-bold mb-3">Permissions</p>
					<Switchcomponenet label="Require sign-in" checked={signIn} onChange={() => setSignIn(!signIn)} />
				</div>
			</div>
		</FormProvider>
		<div className="mt-2">
			<Button classoverride="w-full" onPress={methods.handleSubmit(onSubmit)}>Create form</Button>
		</div>
	</div>;
}

Create.layout = workspace

export default Create