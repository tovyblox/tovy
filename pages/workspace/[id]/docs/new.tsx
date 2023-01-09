import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Button from "@/components/button";
import Input from "@/components/input";
import Workspace from "@/layouts/workspace";
import { useRecoilState } from "recoil";
import { useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { IconCheck, IconChevronDown, IconH1, IconH2, IconH3, IconH4, IconBold, IconItalic, IconListDetails} from "@tabler/icons";
import { useRouter } from "next/router";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import axios from "axios";
import prisma from "@/utils/database";

import { useForm, FormProvider } from "react-hook-form";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const getServerSideProps: GetServerSideProps = withPermissionCheckSsr(async (context) => {
	const { id } = context.query;

	const roles = await prisma.role.findMany({
		where: {
			workspaceGroupId: Number(id),
			isOwnerRole: false
		},
	});


	return {
		props: {
			roles
		},
	};

}, 'manage_docs');

const Home: pageWithLayout<InferGetServerSidePropsType<GetServerSideProps>> = ({ games, roles }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [enabled, setEnabled] = useState(false);
	const [days, setDays] = useState<string[]>([])
	const form = useForm();
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [allowUnscheduled, setAllowUnscheduled] = useState(false);
	const [selectedGame, setSelectedGame] = useState('')
	const [selectedRoles, setSelectedRoles] = useState<string[]>([])
	const router = useRouter();

	const editor = useEditor({
		extensions: [
			StarterKit,
			
		],
		editorProps: {
			attributes: {
				class: 'prose lg:prose-lg  max-w-full leading-normal outline outline-1 focus:outline-blue-400 mt-2 focus:ring-blue-400 focus:ring-1 focus:ring outline-gray-300 bg-white rounded-md p-5',
			},
		},
		content: '',
	});

	const goback = () => {
		window.history.back();
	}

	const createDoc = async () => {
		const session = await axios.post(`/api/workspace/${workspace.groupId}/guides/create`, {
			name: form.getValues().name,
			content: editor?.getJSON(),
			roles: selectedRoles
		}).catch(err => {
			form.setError("name", { type: "custom", message: err.response.data.error })
		});
		if (!session) return;
		form.clearErrors()
		router.push(`/workspace/${workspace.groupId}/docs/${session.data.document.id}`)
	}

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

	

	const buttons = {
		heading: [
			{
				icon: IconH1,
				function: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
				active: () => editor?.isActive('heading', { level: 1 }),
			},
			{
				icon: IconH2,
				function: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
				active: () => editor?.isActive('heading', { level: 2 }),
			},
			{
				icon: IconH3,
				function: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
				active: () => editor?.isActive('heading', { level: 3 }),
			},
			{
				icon: IconH4,
				function: () => editor?.chain().focus().toggleHeading({ level: 4 }).run(),
				active: () => editor?.isActive('heading', { level: 4 }),
			},
		],
		util: [
			{
				icon: IconBold,
				function: () => editor?.chain().focus().toggleBold().run(),
				active: () => editor?.isActive('bold'),
			},
			{
				icon: IconItalic,
				function: () => editor?.chain().focus().toggleItalic().run(),
				active: () => editor?.isActive('italic'),
			},
			
		],
		list: [
			{
				icon: IconListDetails,
				function: () => editor?.chain().focus().toggleBulletList().run(),
				active: () => editor?.isActive('bulletList'),
			},
		]

	}

	return <div className="pagePadding">
		<p className="text-4xl font-bold">New document</p>
		<FormProvider {...form}>
			<div className=" pt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2" >
				<div className="bg-white p-4 border border-1 border-gray-300  rounded-md">
					<p className="text-2xl font-bold">Info</p>
					<Input {...form.register('name', { required: { value: true, message: "This field is required" } })} label="Name" />
				</div>

				<div className="bg-white p-4 border border-1 border-gray-300  rounded-md">
					<p className="text-2xl font-bold mb-2">Permissions </p>
					<p className="text-1xl font-bold mb-2">Viewing</p>
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
				</div>
			</div>
		</FormProvider>
		<div className="mt-2 rounded-md flex gap-x-2">
			{Object.values(buttons).map((group, index) => (
				<div className=" rounded-md overflow-clip my-auto" key={index}>
					{group.map((button, index) => (
						<button key={index} className={`p-2 focus:outline-none ${button.active() ? 'bg-primary/75 hover:bg-primary/50 focus-visible:bg-primary/50' : 'bg-primary hover:bg-primary/75 focus-visible:bg-primary/75'}`} onClick={button.function}>
							<button.icon color="white" />
						</button>
					))}
				</div>
			))}
		</div>
		<EditorContent editor={editor} />

		<div className="flex mt-2">
			<Button classoverride="ml-0" workspace onClick={() => goback()}> Back </Button>
			<Button onPress={form.handleSubmit(createDoc)} workspace> Create </Button>
		</div>

	</div>;
};

Home.layout = Workspace;

export default Home;
