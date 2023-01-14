import React, { FC, ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { Tab, Disclosure, Transition, Listbox } from "@headlessui/react";
import { GetServerSideProps, NextPage } from "next";
import { IconCheck, IconChevronDown } from "@tabler/icons";
import Btn from "@/components/button";
import { workspacestate } from "@/state";
import { useForm, FormProvider } from "react-hook-form";
import { role } from "@/utils/database";
import roles from "@/components/settings/permissions/roles";
import { useRecoilState } from "recoil";
import Input from "@/components/input";
import axios from "axios";
import { format } from "node:path/win32";
type Props = {
	users: any[];
	roles: role[];
};

type form = {
	username: string;
};

const Button: FC<Props> = (props) => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [users, setUsers] = React.useState(props.users);
	const userForm = useForm<form>();
	const { roles } = props;

	//set users role to the role with the same role id passed 
	const updateRole = async (id: number, roleid: string) => {
		const user = users.findIndex((user: any) => user.userid === id);
		console.log(id, roleid)
		const usi = users
		if (!user) return;
		const role = roles.find((role: any) => role.id === roleid);
		console.log(role)
		if (!role) return;
		usi[user].roles = [role];
		setUsers([...usi]);
		await axios.post(
			`/api/workspace/${workspace.groupId}/settings/users/${id}/update`,
			{ role: role.id }
		);
	};

	const removeUser = async (id: number) => {
		const user = users.find((user: any) => user.userid === id);
		if (!user) return;
		setUsers(users.filter((user: any) => user.userid !== id));
		await axios.delete(`/api/workspace/${workspace.groupId}/settings/users/${id}/remove`);
	};

	const addUser = async () => {
		const user = await axios.post(`/api/workspace/${workspace.groupId}/settings/users/add`, {
			username: userForm.getValues().username,
		}).catch(err => {
			userForm.setError("username", { type: "custom", message: err.response.data.error })
		});
		if (!user) return;
		userForm.clearErrors()

		setUsers([...users, user.data.user]);
	};






	return (
		<Disclosure
			as="div"
			className="bg-white p-4 rounded-lg mt-2 transform-all relative z-50"
		>
			{({ open }) => (
				<>
					<Disclosure.Button
						as="div"
						className="text-lg cursor-pointer flex "
					>
						Users
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
						<Disclosure.Panel as="div" className="pt-3">
							<FormProvider {...userForm}>
								<Input {...userForm.register("username")} label="Username" />
							</FormProvider>

							<Btn compact onPress={() => addUser()}>
								Add User
							</Btn>

							{roles.map((role, index) => (
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
													className="px-4 pb-4 -mt-3    w-full"
												>

													{users.filter((user: any) => user.roles[0].id === role.id).length > 100 ? (
														<p className="text-gray-500 text-sm">
															Tovy cant display more than 100 users
														</p>
													) : (
														<>
															{users.filter((user: any) => user.roles[0].id === role.id).map((user: any, index: number) => (
																<div key={user.userid} className="w-auto mt-3 p-4 outline-gray-300 outline outline-[1.75px] rounded-lg flex">
																	<img src={user.thumbnail} className="rounded-full bg-primary h-10 my-auto" />
																	<p className="my-auto font-semibold ml-2 leading-5"> {user.displayName} <br />
																		<span className="font-light text-gray-400">
																			@{user.username}
																		</span>
																	</p>
																	<Listbox value={user.roles[0].id} onChange={(value) => updateRole(user.userid, value)}>
																		<Listbox.Button className="ml-auto bg-gray-100 px-3 rounded-md font-medium text-gray-600 flex"><p className="my-auto">  {user.roles[0].name}</p> <IconChevronDown size={20} className="text-gray-500 my-auto"> </IconChevronDown> </Listbox.Button>
																		<Listbox.Options className="absolute right-0 overflow-clip z-40 mt-12 mr-4 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus-visible:outline-none">
																			<div className="">
																				{workspace.roles.map((role, index) => (
																					<Listbox.Option
																						className={({ active }) =>
																							`${active ? 'text-white bg-indigo-600' : 'text-gray-900'} relative cursor-pointer select-none py-2 pl-3 pr-9`
																						}
																						key={index}
																						value={role.id}
																					>
																						{({ selected, active }) => (
																							<>
																								<div className="flex items-center">
																									<span
																										className={`${selected ? 'font-semibold' : 'font-normal'} ml-3 block truncate`}
																									>
																										{role.name}
																									</span>
																								</div>

																								{selected ? (
																									<span
																										className={`${active ? 'text-white' : 'text-indigo-600'}
																absolute inset-y-0 right-0 flex items-center pr-4`
																										}
																									>
																										<IconCheck className="h-5 w-5" aria-hidden="true" />
																									</span>
																								) : null}
																							</>
																						)}
																					</Listbox.Option>
																				))}
																			</div>
																			<div className="h-[1px] rounded-xl w-full px-3 bg-gray-300" />
																			<button
																				onClick={() => removeUser(user.userid)}
																				className={
																					` hover:text-white hover:bg-indigo-600 w-full relative cursor-pointer select-none py-2 pl-3 pr-9`
																				}
																			>
																				<div className="flex items-center">
																					<span
																						className={`font-normal ml-3 block truncate`}
																					>
																						Delete
																					</span>
																				</div>
																			</button>

																		</Listbox.Options>
																	</Listbox>


																</div>
															))}
														</>
													)}

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
