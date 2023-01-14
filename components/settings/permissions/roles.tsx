import React, { FC, ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { Tab, Disclosure, Transition } from "@headlessui/react";
import { GetServerSideProps, NextPage } from "next";
import { IconChevronDown } from "@tabler/icons";
import Btn from "@/components/button";
import { workspacestate } from "@/state";
import { Role } from "noblox.js";
import { role } from "@/utils/database";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';

import axios from "axios";
type Props = {
	setRoles: React.Dispatch<React.SetStateAction<role[]>>;
	roles: role[];
	grouproles: Role[];
};

type form = {
	permissions: string[];
	name: string;
};

const Button: FC<Props> = ({ roles, setRoles, grouproles }) => {
	const [workspace] = useRecoilState(workspacestate);
	const router = useRouter();
	const permissions = {
		"Admin (Manage workspace)": "admin",
		"Manage sessions": "manage_sessions",
		'View all activity': 'view_entire_groups_activity',
		"Manage activity & members": "manage_activity",
		"Post on wall": "post_on_wall",
		"View members": "view_members",
		'Manage alliances': 'manage_alliances',
		'Represent alliance': 'represent_alliance',
		"Manage docs": "manage_docs",
	};

	const newRole = async () => {
		const res = await axios.post(
			"/api/workspace/" + workspace.groupId + "/settings/roles/new",
			{}
		);
		if (res.status === 200) {
			setRoles([...roles, res.data.role]);
		}
	};

	const updateRole = async (value: string, id: string) => {
		const index = roles.findIndex((role: any) => role.id === id);
		if (index === null) return;
		const rroles = Object.assign(([] as typeof roles), roles);
		rroles[index].name = value;
		setRoles(rroles);
		await axios.post(
			`/api/workspace/${workspace.groupId}/settings/roles/${id}/update`,
			{ name: value, permissions: rroles[index].permissions, groupRoles: rroles[index].groupRoles }
		);
	};

	const togglePermission = async (id: string, permission: string) => {
		const index = roles.findIndex((role: any) => role.id === id);
		if (index === null) return;
		const rroles = Object.assign(([] as typeof roles), roles);
		if (rroles[index].permissions.includes(permission)) {
			rroles[index].permissions = rroles[index].permissions.filter(
				(perm: any) => perm !== permission
			);
		} else {
			rroles[index].permissions.push(permission);
		}
		setRoles(rroles);

		await axios.post(
			`/api/workspace/${workspace.groupId}/settings/roles/${id}/update`,
			{ name: rroles[index].name, permissions: rroles[index].permissions, groupRoles: rroles[index].groupRoles }
		);
	};

	const toggleGroupRole = async (id: string, role: Role) => {
		const index = roles.findIndex((role: any) => role.id === id);
		if (index === null) return;
		const rroles = Object.assign(([] as typeof roles), roles);
		if (rroles[index].groupRoles.includes(role.id)) {
			//GET RID OF ROLE
			rroles[index].groupRoles = rroles[index].groupRoles.filter((r) => r !== role.id);
		} else {
			rroles[index].groupRoles.push(role.id);
		};
		setRoles(rroles)
		await axios.post(
			`/api/workspace/${workspace.groupId}/settings/roles/${id}/update`,
			{ name: rroles[index].name, permissions: rroles[index].permissions, groupRoles: rroles[index].groupRoles }
		);
	}

	const checkRoles = async () => {
		const res = axios.post(
			`/api/workspace/${workspace.groupId}/settings/roles/checkgrouproles`
		);
		toast.promise(res, {
			loading: 'Checking roles...',
			success: 'Roles updated! (you may need to refresh the page to see the updated user list)',
			error: 'Error updating roles'
		});
	};

	const deleteRole = async (id: string) => {
		const res = axios.post(
			`/api/workspace/${workspace.groupId}/settings/roles/${id}/delete`
		).then(() => {
			router.reload();
		});
		toast.promise(res, {
			loading: 'Deleting role...',
			success: 'Role deleted!',
			error: 'Error deleting role'
		});
	}


	const aroledoesincludegrouprole = (id: string, role: Role) => {
		const rs = roles.filter((role: any) => role.id !== id);
		//loop through roles and check if the role includes the group role
		for (let i = 0; i < rs.length; i++) {
			if (rs[i].groupRoles.includes(role.id)) {
				return true;
			}
		}
		return false;
	}

	//rerender when roles change

	return (
		<>
		<Disclosure
			as="div"
			className="bg-white p-4 rounded-lg mt-2 transform-all z-10"
		>
			{({ open }) => (
				<>
					<Disclosure.Button
						as="div"
						className="text-lg cursor-pointer flex "
					>
						Roles
						<IconChevronDown
							color="#AAAAAA"
							className={`ml-auto my-auto transition ${open ? "rotate-180" : ""
								}`}
							size={22}
						/>
					</Disclosure.Button>

					<Transition
						enter="transition-all duration-100 ease-out"
						enterFrom="transform opacity-0 -translate-y-1"
						enterTo="transform opacity-100 translate-y-0"
						leave="transition-all duration-75 ease-out"
						leaveFrom="transform translate-y-0"
						leaveTo="transform opacity-0 -translate-y-1"
					>
						<Disclosure.Panel as="div" className="pt-3 z-10 relative">
							<div className="flex">
								<Btn compact classoverride="ml-0" onPress={newRole}>
									Add Role
								</Btn>
								<Btn compact classoverride="" onPress={checkRoles}>
									Check group roles
								</Btn>
							</div>
							{roles.map((role) => (
								<Disclosure
									as="div"
									key={role.id}
									className="bg-white rounded-lg mt-2 transform-all outline outline-gray-300 outline-[1.75px]"
									tabIndex={0}
								>
									{({ open }) => (
										<>
											<Disclosure.Button
												as="button"
												className="text-lg w-full p-4 cursor-pointer flex focus-visible:bg-gray-300 rounded focus:outline-none"
											>
												{role.name}
												<IconChevronDown
													color="#AAAAAA"
													className={`ml-auto my-auto transition ${open ? "rotate-180" : ""
														}`}
													size={22}
												/>
											</Disclosure.Button>

											<Transition
												enter="transition-all duration-100 ease-out"
												enterFrom="transform opacity-0 -translate-y-1"
												enterTo="transform opacity-100 translate-y-0"
												leave="transition-all duration-75 ease-out"
												leaveFrom="transform translate-y-0"
												leaveTo="transform opacity-0 -translate-y-1"
											>
												<Disclosure.Panel
													as="div"
													className="px-4 pb-3 flex w-full"
												>
													<div>
														<input
															placeholder="Role name"
															value={role.name}
															onChange={(e) =>
																updateRole(e.target.value, role.id)
															}
															className="text-gray-600 dark:text-white rounded-lg p-2 border-2 mb-2 dark:border-gray-500 w-full bg-gray-50 focus-visible:outline-none dark:bg-gray-700 "
														/>
														<p className="text-md font-semibold"> Permissions </p>
														{Object.keys(permissions).map(
															(permission: string, index) => (
																<div
																	key={index}
																	className="flex items-center"
																>
																	<input
																		type="checkbox"
																		checked={role.permissions.includes(
																			permissions[
																			permission as keyof typeof permissions
																			]
																		)}
																		onChange={() =>
																			togglePermission(
																				role.id,
																				permissions[
																				permission as keyof typeof permissions
																				]
																			)
																		}
																		className="rounded-sm mr-2 w-4 h-4 transform transition text-primary bg-slate-100 border-gray-300 hover:bg-gray-300 focus-visible:bg-gray-300 checked:hover:bg-primary/75 checked:focus-visible:bg-primary/75 focus:ring-0"
																	/>
																	<p>{permission}</p>
																</div>
															)
														)}
														<p className="text-md font-semibold"> Group-synced roles </p>
														{grouproles.map(
															(r, index) => (
																<div
																	key={index}
																	className="flex items-center"
																>
																	<input
																		type="checkbox"
																		checked={role.groupRoles.includes(
																			r.id
																		)}
																		onChange={() =>
																			toggleGroupRole(
																				role.id,
																				r
																			)
																		}
																		disabled={aroledoesincludegrouprole(
																			role.id,
																			r
																		)}
																		className="rounded-sm mr-2 w-4 h-4 transform transition text-primary bg-slate-100 border-gray-300 hover:bg-gray-300 focus-visible:bg-gray-300 checked:hover:bg-primary/75 checked:focus-visible:bg-primary/75 disabled:bg-gray-300 focus:ring-0"
																	/>
																	<p>{r.name}</p>
																</div>
															)
														)}
														<Btn classoverride="hover:bg-red-300 focus-visible:bg-red-300 bg-red-500 mt-3" compact onClick={() => deleteRole(role.id)} > Delete </Btn>
													</div>
												</Disclosure.Panel>
											</Transition>
										</>
									)}
								</Disclosure>
							))}
						</Disclosure.Panel>
					</Transition>
				</>
			)}
					

		</Disclosure>
		<Toaster position="bottom-center" />
		</>

	);
};

export default Button;
