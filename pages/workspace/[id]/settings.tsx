import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import { IconChevronDown } from "@tabler/icons";
import Permissions from "@/components/settings/permissions";
import { Tab, Disclosure, Transition } from "@headlessui/react";
import Workspace from "@/layouts/workspace";
import { useRecoilState } from "recoil";
import { InferGetServerSidePropsType, GetServerSideProps } from "next";
import prisma, { role, user } from '@/utils/database'
import { getUsername, getThumbnail, getDisplayName } from "@/utils/userinfoEngine";
export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
	if (!params?.id) {
		res.statusCode = 404;
		return { props: {} }
	}

	//find users with a role that isnt admin
	const users = await prisma.user.findMany({
		where: {
			roles: {
				some: {
					workspaceGroupId: parseInt(params.id as string),
					isOwnerRole: false
				}
			}
		},
		include: {
			roles: {
				where: {
					workspaceGroupId: parseInt(params.id as string),
					isOwnerRole: false
				}
			}
		}
	});

	//get roles that arent admin
	const roles = await prisma.role.findMany({
		where: {
			workspaceGroupId: parseInt(params.id as string),
			isOwnerRole: false
		}
	});

	//promise all to get user with username, displayname and thumbnail
	const usersWithInfo = await Promise.all(users.map(async (user) => {
		const username = await getUsername(user.userid);
		const thumbnail = await getThumbnail(user.userid);
		const displayName = await getDisplayName(user.userid);
		return {
			...user,
			username,
			thumbnail,
			displayName
		}
	}))
	console.log(usersWithInfo)

	


	return {
		props: {
			users: usersWithInfo,
			roles
		}
	}
}

type Props = {
	roles: []
	users: []
};

const Settings: pageWithLayout<Props> = ({ users, roles }) => {
	const [login, setLogin] = useRecoilState(loginState);

	return <div className="px-28 py-20">
		<p className="text-4xl font-bold">Settings</p>
		<a className=""> Tab </a>
		<Tab.Group>
			<Tab.List className="flex py-1 space-x-4">
				<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					General
				</Tab>
				<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Permission
				</Tab>
				<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Ranking
				</Tab>
			</Tab.List>
			<Tab.Panels>
				<Tab.Panel>
					<Disclosure as="div" className="bg-white p-4 rounded-lg mt-2 ">
						<Disclosure.Button as="div" className="text-lg cursor-pointer flex " >Customization <IconChevronDown color="#AAAAAA" className="ml-auto my-auto" size={22} /></Disclosure.Button>

						<Transition
							enter="transition duration-100 ease-out"
							enterFrom="transform opacity-0 -translate-y-1"
							enterTo="transform opacity-100 translate-y-0"
							leave="transition duration-75 ease-out"
							leaveFrom="transform translate-y-0"
							leaveTo="transform opacity-0 -translate-y-1"
						>
							<Disclosure.Panel>
								hi uwu
								
							</Disclosure.Panel>
						</Transition>
					</Disclosure>
				</Tab.Panel>
				<Tab.Panel>
					{users.toString()}
					<Permissions users={users} roles={roles} />
				</Tab.Panel>
			</Tab.Panels>
		</Tab.Group>

	</div>;
};

Settings.layout = Workspace;

export default Settings;
