import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import Workspace from "@/layouts/workspace";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import { useMemo } from "react";
import prisma, { document } from "@/utils/database";
import { GetServerSideProps } from "next";
import randomText from "@/utils/randomText";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";


export const getServerSideProps = withPermissionCheckSsr(async (context: any) => {
	const { id } = context.query;
	const userid = context.req.session.userid;
	if (!userid) {
		return {
			redirect: {
				destination: '/login',
			}
		}
	}
	if (!id) {
		return {
			notFound: true,
		};
	};
	const user = await prisma.user.findFirst({
		where: {
			userid: userid
		},
		include: {
			roles: {
				where: {
					workspaceGroupId: parseInt(id as string)
				}
			}
		}
	});
	if (!user) {
		return {
			redirect: {
				destination: '/login',
			}
		};
	}

	if (user.roles[0].permissions.includes('manage_docs') || user.roles[0].isOwnerRole) {
		const docs = await prisma.document.findMany({
			where: {
				workspaceGroupId: parseInt(id as string)
			},
			include: {
				owner: {
					select: { 
						username: true,
						picture: true
					}
				}
			}
		});
		return {
			props: {
				documents: (JSON.parse(JSON.stringify(docs, (key, value) => (typeof value === 'bigint' ? value.toString() : value))) as typeof docs)
			}
		}
	}
	const docs = await prisma.document.findMany({
		where: {
			workspaceGroupId: parseInt(id as string),
			roles: {
				some: {
					id: user.roles[0].id
				}
			}
		},
		include: {
			owner: {
				select: {
					username: true,
					picture: true,
				}
			}
		}
	})
	return {
		props: {
			documents: (JSON.parse(JSON.stringify(docs, (key, value) => (typeof value === 'bigint' ? value.toString() : value))))
		},
	}
});

type pageProps = {
	documents: (document & { owner: { username: string, picture: string } })[]
}
const Home: pageWithLayout<pageProps> = ({ documents }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const text = useMemo(() => randomText(login.displayname), []);
	
	const router = useRouter();

	const goToGuide = (id: string) => {
		router.push(`/workspace/${router.query.id}/docs/${id}`);
	}

	return <div className="pagePadding">
		<p className="text-4xl font-bold">{text}</p>
		<button className="cardBtn mt-4" onClick={() => router.push(`/workspace/${router.query.id}/docs/new`)}><p className="font-bold text-2xl leading-5 mt-1"> New document <br /><span className="text-gray-400 font-normal text-base "> Create a new document for your group   </span></p> </button>
		<p className="text-3xl font-medium mt-5 mb-5">Docs</p>
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 mt-5">
			{documents.map((document) => (
				<div className="" key={document.id} onClick={() => goToGuide(document.id)}>
					<div className="px-5 py-4 backdrop-blur flex cardBtn cursor-pointer">
						<div><p className="text-xl font-bold"> {document.name} </p>
							<div className="flex mt-1">
								<img src={document.owner?.picture} className="bg-primary rounded-full w-8 h-8 my-auto" />
								<p className="font-semibold pl-2 leading-5 my-auto"> Created by {document.owner?.username} </p>
							</div>
						</div>
					</div>

				</div>
			))}
		</div>
		{!documents.length && (
			<div className="w-full lg:4/6 xl:5/6 rounded-md h-96 bg-white outline-gray-300 outline outline-[1.4px] flex flex-col p-5 mt-3">
			<img className="mx-auto my-auto h-72" alt="fallback image" src={'/conifer-charging-the-battery-with-a-windmill.png'} />
			<p className="text-center text-xl font-semibold">No documents have been created.</p>
		</div>
		)}

	</div>;
};

Home.layout = Workspace;

export default Home;
