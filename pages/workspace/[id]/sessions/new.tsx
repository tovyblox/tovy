import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Button from "@/components/button";
import Input from "@/components/input";
import Workspace from "@/layouts/workspace";
import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { IconCheck, IconChevronDown } from "@tabler/icons";
import { withPermissionCheckSsr} from "@/utils/permissionsManager";
import * as noblox from "noblox.js";
import { useRouter } from "next/router";

import axios from "axios";
import prisma from "@/utils/database";
import Switchcomponenet from "@/components/switch";

import { useForm, FormProvider } from "react-hook-form";
import { GetServerSideProps, InferGetServerSidePropsType} from "next";

export const getServerSideProps: GetServerSideProps = withPermissionCheckSsr(async (context) => {
	const { id } = context.query;
	const games = (await noblox.getGroupGames(Number(id))).map(game => ({
		name: game.name,
		id: game.id,
	}));

	const roles = await prisma.role.findMany({
		where: {
			workspaceGroupId: Number(id),
			isOwnerRole: false
		},
	});

	
	return {
		props: {
			games, roles
		},
	};

}, 'manage_sessions')

const Home: pageWithLayout<InferGetServerSidePropsType<GetServerSideProps>> = ({ games, roles }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [enabled, setEnabled] = useState(false);
	const [days, setDays] = useState<string[]>([])
	const form = useForm();
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [allowUnscheduled, setAllowUnscheduled] = useState(false);
	const [selectedGame , setSelectedGame] = useState('')
	const [selectedRoles, setSelectedRoles] = useState<string[]>([])
	const router = useRouter();

	const createSession = async () => {
		const date = new Date(`${new Date().toDateString()} ${form.getValues().time}`)
		const days2: number[] = days.map(day => {
			const udate = new Date();
			const ds = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
			udate.setDate(date.getDate() + (ds.indexOf(day) - date.getDay() + 7) % 7);
			udate.setHours(date.getHours());
			udate.setMinutes(date.getMinutes());
			udate.setSeconds(0);
			udate.setMilliseconds(0);
			console.log(udate.getUTCDay())

			return udate.getUTCDay();
		})
		console.log(days2)
		const session = await axios.post(`/api/workspace/${workspace.groupId}/sessions/manage/new`, {
			name: form.getValues().name,
			schedule: {
				enabled,
				days: days2, 
				time: `${date.getUTCHours()}:${date.getUTCMinutes()}`,
				allowUnscheduled,
			},
			permissions: selectedRoles
		}).catch(err => {
			form.setError("name", {type: "custom", message: err.response.data.error})
		});
		if (!session) return;
		form.clearErrors()
		router.push(`/workspace/${workspace.groupId}/sessions/schedule`)
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

	const toggleDay = async (day: string) => {
		const newdays = [...days];
		if (newdays.includes(day)) {
			newdays.splice(days.indexOf(day), 1);
		}
		else {
			newdays.push(day);
		}
		setDays(newdays);
		console.log(days)
	}

	useEffect(() => {}, [days]);

	
	

	

	return <div className="pagePadding">
		<p className="text-4xl font-bold">New session type</p>
		<FormProvider {...form}>
			<div className=" pt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2" >
				<div className="bg-white p-4 border border-1 border-gray-300  rounded-md">
					<p className="text-2xl font-bold">Info</p>
					<Input {...form.register('name', { required: { value: true, message: "This field is required"}})} label="Name of session type" />
					<Listbox as="div" className="relative inline-block text-left w-full">
						<Listbox.Button className="ml-auto bg-gray-100 px-3 py-2 w-full rounded-md font-medium text-gray-600 flex"><p className="my-auto">  { games.find((game: any) => game.id === selectedGame)?.name || 'No game selected' }</p> <IconChevronDown size={20} className="text-gray-500 my-auto ml-auto"> </IconChevronDown> </Listbox.Button>
						<Listbox.Options className="absolute right-0 overflow-clip z-40 mt-2  w-56 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus-visible:outline-none">
							<div className="">
								{games.map((game: any) => (
									<Listbox.Option
									className={({ active }) =>
										`${active ? 'text-white bg-indigo-600' : 'text-gray-900'} relative cursor-pointer select-none py-2 pl-3 pr-9`
									}
									value={game.id}
									key={game.id}
									onClick={() => setSelectedGame(game.id)}
								>
									{({ selected, active }) => (
										<>
											<div className="flex items-center">
												<span
													className={`${selected ? 'font-semibold' : 'font-normal'} ml-3 block truncate`}
												>
													{game.name}
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
							<Listbox.Option
									className={({ active }) =>
										`${active ? 'text-white bg-indigo-600' : 'text-gray-900'} relative cursor-pointer select-none py-2 pl-3 pr-9`
									}
									value={'None'}
									onClick={() => setSelectedGame('')}
								>
									{({ selected, active }) => (
										<>
											<div className="flex items-center">
												<span
													className={`${selected ? 'font-semibold' : 'font-normal'} ml-3 block truncate`}
												>
													None
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


						</Listbox.Options>
					</Listbox>
				</div>
				<div className="bg-white p-4 border border-1 border-gray-300  rounded-md">
					<p className="text-2xl font-bold mb-2">Scheulding </p>
					<Switchcomponenet label="Allow unscheduled (coming soon)" classoverride="mb-2" checked={allowUnscheduled} onChange={() => setAllowUnscheduled(!allowUnscheduled)} />
					<Switchcomponenet label="Scheduled" checked={enabled} onChange={() => setEnabled(!enabled)} />
					{enabled && <div className="mt-5">
						<p className="text-2xl font-bold mb-2">Repeting settings</p>
						{/* a week calendar */}
						<div className="grid grid-cols-3 gap-x-3 gap-y-2 mt-5">
							{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
								<button key={day} onClick={() => toggleDay(day)} className={`bg-gray-100 p-3 rounded-md focus-visible:bg-gray-300 ${days.includes(day) ? 'outline-primary outline-[1.5px] outline' : 'focus:outline-none'}`}>
									<p className="text-2xl font-bold text-center">{day}</p>
								</button>
							))}


						</div>
						<p className="text-2xl font-bold mb-2 mt-5">Time</p>
						<Input {...form.register('time', { required: {
							value: enabled,
							message: 'Time is required',
						}})} label="Time" type="time" />
					</div>}


				</div>
				<div className="bg-white p-4 border border-1 border-gray-300  rounded-md">
					<p className="text-2xl font-bold mb-2">Permissions </p>
					<p className="text-1xl font-bold mb-2">Hosting/Claiming</p>
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
		<div className="flex mt-2">
			<Button classoverride="ml-0"> Back </Button>
			<Button onPress={form.handleSubmit(createSession)}> Create </Button>
		</div>

	</div>;
};

Home.layout = Workspace;

export default Home;
