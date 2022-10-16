import React, { FC, ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { Tab, Disclosure, Transition } from "@headlessui/react";
import { GetServerSideProps, NextPage } from "next";
import { IconChevronDown } from "@tabler/icons";
import Btn from "@/components/button";
import { workspacestate } from "@/state";
import { useForm } from "react-hook-form";
import { role } from "@/utils/database";
import { useRecoilState } from "recoil";
import axios from "axios";
type Props = {
	setRoles: React.Dispatch<React.SetStateAction<role[]>>;
	roles: role[];
};

type form = {
	permissions: string[];
	name: string;
};

const Button: FC<Props> = ({ roles, setRoles}) => {
	const [workspace] = useRecoilState(workspacestate);
	const permissions = {
		"Admin (Manage workspace)": "admin",
		"Host sessions": "host_sessions",
		"Post on wall": "post_on_wall",
		"View wall": "view_wall",
		"View members": "view_members",
	};

	const newRole = async () => {
		const res = await axios.post(
			"/api/workspace/" + workspace.groupId + "/settings/roles/new",
			{}
		);
		if (res.status === 200) {
			console.log("pushing role");
			setRoles([...roles, res.data.role]);
		}
	};

	const updateRole = async (value: string, id: number) => {
		console.log("uas");
		const role = roles.find((role: any) => role.id === id);
		if (!role) return;
		role.name = value;
		const rroles = roles.filter((role: any) => role.id !== id);
		setRoles([...workspace.roles, role]);
		await axios.post(
			`/api/workspace/${workspace.groupId}/settings/roles/${id}/update`,
			{ name: value, permissions: role.permissions }
		);
	};

	const togglePermission = async (id: number, permission: string) => {
		const role = roles.find((role: any) => role.id === id);
		if (!role) return;
		const rroles = roles.filter((role: any) => role.id !== id);
		if (role.permissions.includes(permission)) {
			role.permissions = role.permissions.splice(
				role.permissions.indexOf(permission),
				1
			);
		} else {
			role.permissions.push(permission);
		}
		setRoles([...workspace.roles, role]);

		await axios.post(
			`/api/workspace/${workspace.groupId}/settings/roles/${id}/update`,
			{ name: role.name, permissions: role.permissions }
		);
	};

	//rerender when roles change
	useEffect(() => {
		console.log(roles);
		setRoles(roles);
	}, [roles]);

	return (
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
								<Btn compact onPress={newRole}>
									Add Role
								</Btn>
								{roles.map((role: any) => (
									<Disclosure
										as="div"
										key={role.id}
										className="bg-white rounded-lg mt-2 transform-all outline outline-[#AAAAAA] outline-[1.75px]"
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
			
	);
};

export default Button;
