import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import axios from "axios";
import { useEffect, useState } from "react";
import { Popover } from "@headlessui/react";
import { InferGetServerSidePropsType } from "next";
import { useRecoilState } from "recoil";
import Input from "@/components/input";
import { v4 as uuidv4 } from 'uuid';

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { FormProvider, useForm } from "react-hook-form";
import Button from "@/components/button";

type Role = {
	name: string
	rank: number
}

type User = {
	info: {
		userId: number
		username: string
		displayName: string
	}
	role: Role
}

export const getServerSideProps = async () => {
	const { data: group } = await axios.get(`https://groups.roblox.com/v1/groups/2700627`);

	const { data: { previousPageCursor, nextPageCursor, data: users } } = await axios.get(`https://groups.roblox.com/v1/groups/2700627/users?sortOrder=Asc&limit=25`);
	const pages = Math.abs(Math.round(group.memberCount / 25));
	const computedUsers: User[] = [];

	users.forEach(({ user, role }: any) => {
		computedUsers.push({
			info: {
				userId: user.userId,
				username: user.username,
				displayName: user.displayName,
			},
			role: {
				name: role.name,
				rank: role.rank
			}
		})
	});

	return {
		props: {
			usersInGroup: computedUsers,
			pages,
		}
	};
}

const filters: {
	[key: string]: string[]
} = {
	username: [
		'equal',
		'notEqual',
		'contains',
	]
}

const filterNames: {
	[key: string]: string
} = {
	'equal': 'Equals',
	'notEqual': 'Does not equal',
	'contains': 'Contains',
}

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Views: pageWithLayout<pageProps> = ({ usersInGroup, pages }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const columnHelper = createColumnHelper<User>();
	const [users, setUsers] = useState(usersInGroup);



	const columns = [
		columnHelper.accessor('info', {
			header: 'User',
			cell: (row) => {
				return (
					<div className="flex flex-row">
						<img src={`https://www.roblox.com/headshot-thumbnail/image?userId=${row.getValue().userId}&width=50&height=50&format=`} className="w-10 h-10 rounded-full " alt="profile image" />
						<p className="leading-5 my-auto px-2">
							{row.getValue().displayName} <br />
						</p>
					</div>
				);
			}
		})
	];

	const table = useReactTable({
		columns,
		data: users,
		getCoreRowModel: getCoreRowModel()
	});

	const [colFilters, setColFilters] = useState([
		{ id: '327823784', column: 'username', filter: 'equal', value: 'test' }
	]);

	const newfilter = () => {
		console.log('new filter');
		setColFilters([...colFilters, { id: uuidv4(), column: 'user', filter: 'equal', value: '' }])
	};

	const removeFilter = (id: string) => {
		setColFilters(colFilters.filter((filter) => filter.id !== id));
	}
	const updateFilter = (id: string, column: string, filter: string, value: string) => {
		console.log('e')
		const fil = colFilters.filter((filter) => filter.id !== id);
		fil.push({ id, column, filter, value });
		setColFilters(fil);
	};

	useEffect(() => {
		const filteredUsers = usersInGroup.filter((user) => {
			let valid = true;
			colFilters.forEach((filter) => {
				if (filter.column === 'username') {
					if (!filter.value) return;
					if (filter.filter === 'equal') {
						if (user.info.username !== filter.value) {
							valid = false;
						}
					} else if (filter.filter === 'notEqual') {
						if (user.info.username === filter.value) {
							valid = false;
						}
					} else if (filter.filter === 'contains') {
						if (!user.info.username.includes(filter.value)) {
							valid = false;
						}
					}
				}
			});
			return valid;
		});
		setUsers(filteredUsers);
	}, [colFilters]);


	return <div className="px-28 py-20">
		<p>{pages}</p>
		<Popover as="div" className="relative inline-block w-full text-left pb-2">
			<div className="w-full">
				<Popover.Button as={Button} >
					Filters
				</Popover.Button>
			</div>
			<Popover.Panel className="absolute left-0 z-20 mt-2 w-80 origin-top-left rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-300 focus-visible:outline-none p-3">
				<Button onClick={newfilter}> Add filter </Button>
				{colFilters.map((filter) => (
					<div className="p-3 outline outline-gray-300 rounded-md mt-4 outline-1" key={filter.id}> <Filter updateFilter={(col, op, value) => updateFilter(filter.id, col, op, value)} deleteFilter={() => removeFilter(filter.id)} data={filter} /> </div>
				))}
				
			</Popover.Panel>
		</Popover>
		<table className="table-auto bg-white w-full rounded-xl border-1 border border-separate border-gray-300 p-3">
			<thead className="border-separate text-left text-slate-400 text-sm">
				{table.getHeaderGroups().map((headerGroup) => (
					<tr className="font-medium" key={headerGroup.id}>
						{headerGroup.headers.map((column) => (
							<th className="font-normal" key={column.id}>{column.isPlaceholder
								? null
								: flexRender(
									column.column.columnDef.header,
									column.getContext()
								)}</th>
						))}

					</tr>
				))}
			</thead>
			<tbody className="border-seperate">
				{table.getRowModel().rows.map(row => (
					<tr key={row.id}>
						{row.getVisibleCells().map(cell => (
							<td key={cell.id}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	</div>;
};

const Filter: React.FC<{
	data: any
	updateFilter: (column: string, op: string, value: string) => void
	deleteFilter: () => void
}> = (
	{
		updateFilter,
		deleteFilter,
		data,
	}
) => {
		const methods = useForm<{
			col: string
			op: string
			value: string
		}>({
			defaultValues: {
				col: data.column,
				op: data.filter,
				value: data.value
			}
		});
		const { register, handleSubmit } = methods;
		useEffect(() => {
			const subscription = methods.watch((value) => {
				updateFilter(methods.getValues().col, methods.getValues().op, methods.getValues().value);
			});
			return () => subscription.unsubscribe();
		}, [methods.watch]);

		

		return (
			<FormProvider {...methods}>
				<div> <Button onClick={deleteFilter}> Delete </Button> </div>
				<label className="text-gray-500 text-sm dark:text-gray-200">
					Col
				</label>
				<select {...register('col')} className={"text-gray-600 dark:text-white rounded-lg p-2 border-2 border-gray-300  dark:border-gray-500 w-full bg-gray-50 focus-visible:outline-none dark:bg-gray-700 focus-visible:ring-tovybg focus-visible:border-tovybg"}>
					{Object.keys(filters).map((filter) => (
						<option value={filter} key={filter}>{filter}</option>
					))}
				</select>
				<label className="text-gray-500 text-sm dark:text-gray-200">
					OP
				</label>
				<select  {...register('op')} className={"text-gray-600 dark:text-white rounded-lg p-2 border-2 border-gray-300  dark:border-gray-500 w-full bg-gray-50 focus-visible:outline-none dark:bg-gray-700 focus-visible:ring-tovybg focus-visible:border-tovybg"}>
					{filters[methods.getValues().col].map((filter) => (
						<option value={filter} key={filter}>{filterNames[filter]}</option>
					))}

				</select>
				<Input {...register('value')} label="Value" />

			</FormProvider>
		)
	}

Views.layout = workspace

export default Views