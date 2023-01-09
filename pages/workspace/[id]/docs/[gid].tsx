import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Workspace from "@/layouts/workspace";
import { useState, useMemo } from "react";
import prisma from "@/utils/database";
import { useRecoilState } from "recoil";
import axios from "axios";
import Button from "@/components/button";
import StarterKit from '@tiptap/starter-kit'
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { generateHTML } from '@tiptap/html'


type Props = {
	document: any;
}

export const getServerSideProps: GetServerSideProps = withPermissionCheckSsr(async (context) => {
	const { gid } = context.query;
	if (!gid) return { notFound: true };
	const user = await prisma.user.findUnique({
		where: {
			userid: BigInt(context.req.session.userid)
		},
		include: {
			roles: {
				where: {
					workspaceGroupId: parseInt(context.query.id as string)
				}
			}
		}
	});
	const guide = await prisma.document.findUnique({
		where: {
			id: (gid as string),
		},
		include: {
			owner: {
				select: {
					username: true,
					picture: true,
				}
			},
			roles: true
		}
	}).catch(() => null);
	if (!guide) return { notFound: true };
	if (!guide.roles.find(role => role.id === user?.roles[0].id) && !user?.roles[0].isOwnerRole && !user?.roles[0].permissions.includes('manage_docs')) return { notFound: true };


	return {
		props: {
			document: JSON.parse(JSON.stringify(guide, (key, value) => (typeof value === 'bigint' ? value.toString() : value))),
		},
	}
})



const Settings: pageWithLayout<Props> = ({ document }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const router = useRouter();
	const [wallMessage, setWallMessage] = useState("");
	const friendlyDate = `${new Date(document.createdAt).toLocaleDateString()} at ${new Date(document.createdAt).toLocaleTimeString()}`;

	const output = useMemo(() => {
		return generateHTML((document.content as Object), [
			StarterKit
		])
	}, [document.content]);

	const deleteDoc = async () => {
		await axios.post(`/api/workspace/${workspace.groupId}/guides/${document.id}/delete`, {}, {});
		router.push(`/workspace/${workspace.groupId}/docs`);
		
	}

	const goback = () => {
		window.history.back();
	}

	return <div className="pagePadding">
		<p className="text-6xl font-bold mt-3">{document.name}</p>
		<div className="flex my-6">
			<img src={document.owner.picture} className="bg-primary rounded-full w-12 h-12 my-auto" />
			<p className="font-semibold pl-2 leading-5 my-auto"> Created by {document.owner.username} <br /> <span className="text-primary"> Updated {friendlyDate} </span> </p>
		</div>
		<div className="prose max-w-full break-words mx-auto">
			<div className="leading-normal outline outline-1 -mt-3 outline-gray-300 bg-white rounded-md py-5 p-5" dangerouslySetInnerHTML={{ __html: output }} />
		</div>
		<div className="flex mt-6">
			<Button classoverride="ml-0" workspace onClick={goback}> Back </Button>
			{workspace.yourPermission.includes('manage_docs') && <Button classoverride="bg-red-600 hover:bg-red-300 focus-visible:bg-red-300  " workspace onClick={deleteDoc}> Delete </Button>}
		</div>
	</div>;
};

Settings.layout = Workspace;

export default Settings;
