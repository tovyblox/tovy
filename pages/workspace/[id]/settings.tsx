import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import { IconChevronDown } from "@tabler/icons";
import Permissions from "@/components/settings/permissions";
import { Tab, Disclosure, Transition } from "@headlessui/react";
import Workspace from "@/layouts/workspace";
import { useRecoilState } from "recoil";
import { GetServerSideProps } from "next";
import * as All from "@/components/settings/general"
import toast, { Toaster } from 'react-hot-toast';
import * as noblox from "noblox.js";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import prisma from '@/utils/database'
import { getUsername, getThumbnail, getDisplayName } from "@/utils/userinfoEngine";
export const getServerSideProps: GetServerSideProps = withPermissionCheckSsr(async ({ params, res }) => {
	if (!params?.id) {
		res.statusCode = 404;
		return { props: {} }
	}

	//find users with a role that isnt admin
	const grouproles = await noblox.getRoles(Number(params.id));
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
		const username = user.username || await getUsername(user.userid);
		const thumbnail = user.picture || '';
		const displayName = user.username || await getDisplayName(user.userid);
		return {
			...user,
			userid: Number(user.userid),
			username,
			thumbnail,
			displayName
		}
	}))
	console.log(usersWithInfo)




	return {
		props: {
			users: usersWithInfo,
			roles,
			grouproles
		}
	}
}, 'admin')

type Props = {
	roles: []
	users: []
	grouproles: []
};

const Settings: pageWithLayout<Props> = ({ users, roles, grouproles }) => {
	const [login, setLogin] = useRecoilState(loginState);

	return <div className="pagePadding">
		<p className="text-4xl font-bold mb-2">Settings</p>
		<Tab.Group>
			<Tab.List className="flex py-1 space-x-4">
				<Tab className={({ selected }) =>
					`w-1/2 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					General
				</Tab>
				<Tab className={({ selected }) =>
					`w-1/2 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Permission
				</Tab>
			</Tab.List>
			<Tab.Panels>
				<Tab.Panel>
					{Object.values(All).map((Component, index) => {
						return (
							<Disclosure as="div" className="bg-white p-4 rounded-xl mt-2 " key={index}>
								<Disclosure.Button as="div" className="text-lg cursor-pointer flex " >{Component.title} <IconChevronDown color="#AAAAAA" className="ml-auto my-auto" size={22} /></Disclosure.Button>
								<Transition
									enter="transition duration-100 ease-out"
									enterFrom="transform opacity-0 -translate-y-1"
									enterTo={`transform opacity-100 translate-y-0 relative ${Component.isAboveOthers ? "z-40" : "z-10"}`}
									leave="transition duration-75 ease-out"
									leaveFrom="transform translate-y-0"
									leaveTo="transform opacity-0 -translate-y-1"
								>
									<Disclosure.Panel>
										<Component triggerToast={toast} />
									</Disclosure.Panel>
								</Transition>
							</Disclosure>
						)
					})}
				</Tab.Panel>
				<Tab.Panel>
					<Permissions users={users} roles={roles} grouproles={grouproles}/>
				</Tab.Panel>

			</Tab.Panels>
		</Tab.Group>
		<Toaster position="bottom-center" />
	</div>;
};

Settings.layout = Workspace;

export default Settings;
