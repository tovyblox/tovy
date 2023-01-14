import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Popover, Transition } from "@headlessui/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getThumbnail } from "@/utils/userinfoEngine";
import { useRecoilState } from "recoil";
import noblox from "noblox.js";
import Input from "@/components/input";
import { v4 as uuidv4 } from 'uuid';
import prisma from "@/utils/database"

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	// @ts-ignore
	onColumnVisibilityChange,
	getSortedRowModel,
	SortingState,
	getPaginationRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { FormProvider, useForm } from "react-hook-form";
import Button from "@/components/button";
import SwitchComponenet from "@/components/switch";
import { inactivityNotice, Session, user, userBook, wallPost } from "@prisma/client";
import Checkbox from "@/components/checkbox";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";

type User = {
	info: {
		userId: BigInt
		username: string | null
		picture: string | null
	}
	book: userBook[]
	wallPosts: wallPost[]
	inactivityNotices: inactivityNotice[]
	sessions: Session[]
	rankID: number
	minutes: number
	idleMinutes: number
	hostedSessions: any,
	messages: number
}

export const getServerSideProps = withPermissionCheckSsr(async ({ params }: GetServerSidePropsContext) => {
	const allUsers = await prisma.user.findMany({
		where: {
			roles: {
				some: {
					workspaceGroupId: parseInt(params?.id as string)
				}
			}
		},
		include: {
			book: true,
			wallPosts: true,
			inactivityNotices: true,
			sessions: true,
			ranks: true
		}
	});
	const allActivity = await prisma.activitySession.findMany({
		where: {
			workspaceGroupId: parseInt(params?.id as string)
		},
		include: {
			user: {
				include: {
					writtenBooks: true,
					wallPosts: true,
					inactivityNotices: true,
					sessions: true,
					ranks: true
				}
		}
	}
	});

	const allHostedSessions = await prisma.session.findMany({
		where: {
			ended: {
				not: null
			}
		}
	});

	const computedUsers: any[] = []
	const ranks = await noblox.getRoles(parseInt(params?.id as string));

	for (const user of allUsers) {
		const ms: number[] = [];
		allActivity.filter(x => BigInt(x.userId) == user.userid && !x.active).forEach((session) => {
			ms.push(session.endTime?.getTime() as number - session.startTime.getTime());
		});

		const ims: number[] = [];
		allActivity.filter((x: any) => BigInt(x.userId) == user.userid).forEach((s: any) => {
			ims.push(Number(s.idleTime))
		})

		const sh: any[] = []
		allHostedSessions.filter((x: any) => BigInt(x.ownerId) == user.userid).forEach((s) => {
			sh.push(s)
		})

		const messages: number[] = []
		allActivity.filter((x: any) => BigInt(x.userId) == user.userid).forEach((s: any) => {
			messages.push(s.messages)
		})

		computedUsers.push({
			info: {
				userId: Number(user.userid),
				picture: user.picture || '',
				username: user.username,
			},
			book: user.book,
			wallPosts: user.wallPosts,
			inactivityNotices: user.inactivityNotices,
			sessions: user.sessions,
			rankID: user.ranks[0]?.rankId ? Number(user.ranks[0]?.rankId) : 0,
			minutes: ms.length ? Math.round(ms.reduce((p, c) => p + c) / 60000) : 0,
			idleMinutes: ims.length ? Math.round(ims.reduce((p, c) => p + c)) : 0,
			hostedSessions: sh,
			messages: messages.length ? Math.round(messages.reduce((p, c) => p + c)) : 0
		})
	}

	//find users who have an activity session not on computedUsers
	const usersNotInComputedUsers = allActivity.filter((x: any) => !computedUsers.find((y: any) => BigInt(y.info.userId) == BigInt(x.userId)))
	//map them to the computedUsers array
	usersNotInComputedUsers.forEach((x: any) => {
		if (computedUsers.find((y: any) => BigInt(y.info.userId) == BigInt(x.userId))) return;
		const ms: number[] = [];
		allActivity.filter((y: any) => BigInt(y.userId) == BigInt(x.userId) && !y.active).forEach((session) => {
			ms.push(session.endTime?.getTime() as number - session.startTime.getTime());
		});

		const messages: number[] = []
		allActivity.filter((y: any) => BigInt(y.userId) == BigInt(x.userId)).forEach((s: any) => {
			messages.push(s.messages)
		})


		computedUsers.push({
			info: {
				userId: Number(x.userId),
				picture: x.user.picture || null,
				username: x.user.username,
			},
			book: [],
			wallPosts: [],
			inactivityNotices: [],
			sessions: [],
			rankID: x.user.ranks[0]?.rankId ? Number(x.user.ranks[0]?.rankId) : 0,
			minutes: ms.length ? Math.round(ms.reduce((p, c) => p + c) / 60000) : 0,
			idleMinutes: 0,
			hostedSessions: [],
			messages: messages.length ? Math.round(messages.reduce((p, c) => p + c)) : 0
		})
	})

	return {
		props: {
			usersInGroup: (JSON.parse(JSON.stringify(computedUsers, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))) as User[]),
			ranks: ranks
		}
	};
}, "view_members");

const filters: {
	[key: string]: string[]
} = {
	username: [
		'equal',
		'notEqual',
		'contains',
	],
	minutes: [
		'equal',
		'greaterThan',
		'lessThan',
	],
	idle: [
		'equal',
		'greaterThan',
		'lessThan'
	],
	rank: [
		'equal',
		'greaterThan',
		'lessThan',
	],
	sessions: [
		'equal',
		'greaterThan',
		'lessThan'
	],
	hosted: [
		'equal',
		'greaterThan',
		'lessThan'
	],
	warnings : [
		'equal',
		'greaterThan',
		'lessThan'
	],
	messages: [
		'equal',
		'greaterThan',
		'lessThan'
	],
	notices: [
		'equal',
		'greaterThan',
		'lessThan'
	]
}

const filterNames: {
	[key: string]: string
} = {
	'equal': 'Equals',
	'notEqual': 'Does not equal',
	'contains': 'Contains',
	'greaterThan': 'Greater than',
	'lessThan': 'Less than'
}

type pageProps = {
	usersInGroup: User[];
	ranks: {
		id: number;
		rank: number;
		name: string;
	}[]

}
const Views: pageWithLayout<pageProps> = ({ usersInGroup, ranks }) => {
	const router = useRouter();
	const { id } = router.query;
	const [login, setLogin] = useRecoilState(loginState);
	const columnHelper = createColumnHelper<User>();
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState({});
	const [isOpen, setIsOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [type, setType] = useState("");
	const [minutes, setMinutes] = useState(0);
	const [users, setUsers] = useState(usersInGroup);

	const updateUsers = async (query: string) => {
		
	}

	const columns = [
		{
			id: "select",
			header: ({ table }: any) => (
				<Checkbox
					{...{
						checked: table.getIsAllRowsSelected(),
						indeterminate: table.getIsSomeRowsSelected(),
						onChange: table.getToggleAllRowsSelectedHandler(),
					}}
				/>
			),
			cell: ({ row }: any) => (
				<Checkbox
					{...{
						checked: row.getIsSelected(),
						indeterminate: row.getIsSomeSelected(),
						onChange: row.getToggleSelectedHandler(),
					}}
				/>
			)
		},
		columnHelper.accessor("info", {
			header: 'User',
			cell: (row) => {
				return (
					<div className="flex flex-row cursor-pointer" onClick={() => router.push(`/workspace/${router.query.id}/profile/${row.getValue().userId}`)}>
						<img src={row.getValue().picture!} className="w-10 h-10 rounded-full bg-primary " alt="profile image" />
						<p className="leading-5 my-auto px-2 font-semibold">
							{row.getValue().username} <br />
						</p>
					</div>
				);
			}
		}),
		columnHelper.accessor("sessions", {
			header: 'Sessions claimed',
			cell: (row) => {
				return (
					<p>{row.getValue().length}</p>
				);
			}
		}),
		columnHelper.accessor("hostedSessions", {
			header: 'Sessions hosted',
			cell: (row) => {
				return (
					<p>{row.getValue().length}</p>
				);
			}
		}),
		columnHelper.accessor("book", {
			header: 'Warnings',
			cell: (row) => {
				return (
					<p>{row.getValue().filter(x => x.type == "warning").length}</p>
				);
			}
		}),
		columnHelper.accessor("wallPosts", {
			header: 'Wall Posts',
			cell: (row) => {
				return (
					<p>{row.getValue().length}</p>
				);
			}
		}),
		columnHelper.accessor("rankID", {
			header: 'Rank',
			cell: (row) => {
				return (
					<p>{ranks.find(x => x.rank == row.getValue())?.name || "N/A"}</p>
				);
			}
		}),
		columnHelper.accessor("inactivityNotices", {
			header: 'Inactivity Notices',
			cell: (row) => {
				return (
					<p>{row.getValue().length}</p>
				);
			}
		}),
		columnHelper.accessor("minutes", {
			header: 'Minutes',
			cell: (row) => {
				return (
					<p>{row.getValue()}</p>
				);
			}
		}),
		columnHelper.accessor("idleMinutes", {
			header: 'Idle minutes',
			cell: (row) => {
				return (
					<p>{row.getValue()}</p>
				);
			}
		}),
		columnHelper.accessor("messages", {
			header: 'Messages',
			cell: (row) => {
				return (
					<p>{row.getValue()}</p>
				);
			}
		}),
	];

	const [columnVisibility, setColumnVisibility] = useState([])

	const table = useReactTable({
		columns,
		data: users,
		state: {
			sorting,
			rowSelection,
			// @ts-ignore
			columnVisibility,
		},
		// @ts-ignore
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	const [colFilters, setColFilters] = useState<{
		id: string
		column: string
		filter: string
		value: string
	}[]>([]);

	const newfilter = () => {
		setColFilters([...colFilters, { id: uuidv4(), column: 'username', filter: 'equal', value: '' }])
	};
	const removeFilter = (id: string) => {
		setColFilters(colFilters.filter((filter) => filter.id !== id));
	}
	const updateFilter = (id: string, column: string, filter: string, value: string) => {
		const OBJ = Object.assign(([] as typeof colFilters), colFilters);
		const index = OBJ.findIndex((filter) => filter.id === id);
		OBJ[index] = { id, column, filter, value };
		setColFilters(OBJ);
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
						if (!user.info.username?.includes(filter.value)) {
							valid = false;
						}
					}
				} else if (filter.column === 'minutes') {
					if (!filter.value) return;
					if (filter.filter === 'equal') {
						if (user.minutes !== parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'greaterThan') {
						if (user.minutes <= parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'lessThan') {
						if (user.minutes >= parseInt(filter.value)) {
							valid = false;
						}
					}
				} else if (filter.column === 'idle') {
					if (!filter.value) return;
					if (filter.filter === 'equal') {
						if (user.idleMinutes !== parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'greaterThan') {
						if (user.idleMinutes <= parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'lessThan') {
						if (user.idleMinutes >= parseInt(filter.value)) {
							valid = false;
						}
					}
				} else if (filter.column === 'rank') {
					if (!filter.value) return;
					if (filter.filter === 'equal') {
						if (user.rankID !== parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'greaterThan') {
						if (user.rankID <= parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'lessThan') {
						if (user.rankID >= parseInt(filter.value)) {
							valid = false;
						}
					}
				} else if (filter.column === 'hosted') {
					if (!filter.value) return;
					if (filter.filter === 'equal') {
						if (user.hostedSessions.length !== parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'greaterThan') {
						if (user.hostedSessions.length <= parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'lessThan') {
						if (user.hostedSessions.length >= parseInt(filter.value)) {
							valid = false;
						}
					}
				}  else if (filter.column === 'sessions') {
					if (!filter.value) return;
					if (filter.filter === 'equal') {
						if (user.sessions.length !== parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'greaterThan') {
						if (user.sessions.length <= parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'lessThan') {
						if (user.sessions.length >= parseInt(filter.value)) {
							valid = false;
						}
					}
				} else if (filter.column === 'warnings') {
					if (!filter.value) return;
					if (filter.filter === 'equal') {
						if (user.book.filter(x => x.type == "warning").length !== parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'greaterThan') {
						if (user.book.filter(x => x.type == "warning").length <= parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'lessThan') {
						if (user.book.filter(x => x.type == "warning").length >= parseInt(filter.value)) {
							valid = false;
						}
					}
				} else if (filter.column === 'messages') {
					if (!filter.value) return;
					if (filter.filter === 'equal') {
						if (user.messages !== parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'greaterThan') {
						if (user.messages <= parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'lessThan') {
						if (user.messages >= parseInt(filter.value)) {
							valid = false;
						}
					}
				} else if (filter.column === 'notices') {
					if (!filter.value) return;
					if (filter.filter === 'equal') {
						if (user.inactivityNotices.length !== parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'greaterThan') {
						if (user.inactivityNotices.length <= parseInt(filter.value)) {
							valid = false;
						}
					} else if (filter.filter === 'lessThan') {
						if (user.inactivityNotices.length >= parseInt(filter.value)) {
							valid = false;
						}
					}
				}
			});
			return valid;
		});
		setUsers(filteredUsers);
	}, [colFilters]);

	const massAction = () => {
		const selected = table.getSelectedRowModel().flatRows;
		const promises: any[] = [];
		for (const select of selected) {
			const data = select.original;

			if (type == "add") {
				promises.push(axios.post(
					`/api/workspace/${id}/activity/add`,
					{ userId: data.info.userId, minutes }
				));
			} else {
				promises.push(axios.post(
					`/api/workspace/${id}/userbook/${data.info.userId}/new`,
					{ notes: message, type }
				));
			}
		}

		toast.promise(
			Promise.all(promises),
			{
				loading: "Actions in progress...",
				success: () => {
					setIsOpen(false);
					return "Actions applied!"
				},
				error: "Could not perform actions."
			}
		);

		setIsOpen(false);
		setMessage("");
		setType("");
	}

	const [searchOpen, setSearchOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState([])

	const updateSearchQuery = async (query: any) => {
		setSearchQuery(query)
		setSearchOpen(true)
		if(query == "") {
			 setSearchOpen(false) 
			 setColFilters([])
			 return
			} else { setSearchOpen(true) }
		const userRequest = await axios.get(`/api/workspace/${id}/staff/search/${query}`)
		const userList = userRequest.data.users
		setSearchResults(userList)
	}

	const updateSearchFilter = async (username: string) => {
		setSearchQuery(username)
		setSearchOpen(false)
		setColFilters([{ id: uuidv4(), column: 'username', filter: 'equal', value: username }])
	}

	const getSelectionName = (columnId: string) => {
		if (columnId == "sessions") { 
			return "Sessions claimed"
		} else if (columnId == "hostedSessions") {
			return 'Hosted sessions'
		} else if (columnId == "book") {
			return "Warnings"
		} else if (columnId == "wallPosts") {
			return "Wall Posts"
		} else if (columnId == "rankID") {
			return "Rank"
		} else if (columnId == "inactivityNotices") {
			return "Inactivity notices"
		} else if (columnId == "minutes") {
			return "Minutes"
		} else if (columnId == "idleMinutes") {
			return "Idle minutes"
		} else if (columnId == "messages") {
			return "Messages"
		}
 	}

	return <>
		<Toaster position="bottom-center" />

		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25" />
				</Transition.Child>

				<div className="fixed inset-0 overflow y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
								<Dialog.Title as="p" className="my-auto text-2xl font-bold">Mass action: {type} {type == "add" || type == "deduct" ? "minutes" : ""}</Dialog.Title>

								<div className="mt-2">
									<input
										className="text-gray-600 dark:text-white rounded-lg p-2 border-2 border-gray-300 dark:border-gray-500 w-full bg-gray-50 focus-visible:outline-none dark:bg-gray-700 focus-visible:ring-blue-500 focus-visible:border-blue-500"
										type={type == "add" || type == "deduct" ? "number" : "text"}
										placeholder={type == "add" || type == "deduct" ? "Minutes" : "Message"}
										value={type == "add" || type == "deduct" ? minutes : message}
										onChange={(e) => {
											if (type == "add" || type == "deduct") {
												setMinutes(parseInt(e.target.value))
											} else {
												setMessage(e.target.value)
											}
										}}
									/>
								</div>
								<div className="mt-4 flex">
									<Button classoverride="bg-red-500 hover:bg-red-300 ml-0" onPress={() => setIsOpen(false)}> Cancel </Button>
									<Button classoverride="" onPress={massAction}> Submit </Button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>

		<div className="pagePadding">

			<div className="flex flex-col md:flex-row gap-2">
				<div className="flex flex-row gap-2">
				<Popover as="div" className="relative inline-block text-left pb-2">
						<Popover.Button as={Button} classoverride="ml-0" >
							Rows
						</Popover.Button>
					<Popover.Panel className="absolute left-0 z-20 mt-2 w-80 origin-top-left rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-300 focus-visible:outline-none p-3">
						<div className="flex flex-col gap-1">
								{table.getAllLeafColumns().map((column: any) => {
									if (column.id !== "select" && column.id !== "info") {
										return (
											<div key={column.id}>
												<Checkbox {...{
													type: 'checkbox',
													checked: column.getIsVisible(),
													onChange: column.getToggleVisibilityHandler(),
												}} />{' '}
												{getSelectionName(column.id)}
											</div>
										)
									}
								})}
							</div>
					</Popover.Panel>
				</Popover>
				<Popover as="div" className="relative inline-block text-left pb-2">
					
					<Popover.Button as={Button} classoverride="ml-0" >
						Filters
					</Popover.Button>
					
					<Popover.Panel className="absolute left-0 z-20 mt-2 w-80 origin-top-left rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-300 focus-visible:outline-none p-3">
						<Button onClick={newfilter}> Add filter </Button>
						{colFilters.map((filter) => (
							<div className="p-3 outline outline-gray-300 rounded-md mt-4 outline-1" key={filter.id}> <Filter ranks={ranks} updateFilter={(col, op, value) => updateFilter(filter.id, col, op, value)} deleteFilter={() => removeFilter(filter.id)} data={filter} /> </div>
						))}
					</Popover.Panel>
				</Popover>
				</div>
			
				{table.getSelectedRowModel().flatRows.length > 0 && (
							<div className="flex flex-row flex-wrap gap-2 mb-2">
								<Button classoverride="bg-green-500 hover:bg-green-500/50 ml-0" onPress={() => { setType("promotion"); setIsOpen(true) }}>Mass promote {table.getSelectedRowModel().flatRows.length} users</Button>
								<Button classoverride="bg-orange-500 hover:bg-orange-500/50 ml-0" onPress={() => { setType("warning"); setIsOpen(true) }}>Mass warn {table.getSelectedRowModel().flatRows.length} users</Button>
								<Button classoverride="bg-gray-800 hover:bg-gray-800/50 ml-0" onPress={() => { setType("suspension"); setIsOpen(true) }}>Mass suspend {table.getSelectedRowModel().flatRows.length} users</Button>
								<Button classoverride="bg-red-500 hover:bg-red-500/50 ml-0" onPress={() => { setType("fire"); setIsOpen(true) }}>Mass fire {table.getSelectedRowModel().flatRows.length} users</Button>
								<Button classoverride="bg-emerald-500 hover:bg-emerald-500/50 ml-0" onPress={() => { setType("add"); setIsOpen(true) }}>Add minutes to {table.getSelectedRowModel().flatRows.length} users</Button>
							</div>
						)}
				{table.getSelectedRowModel().flatRows.length == 0 && (
					<div className="relative inline-block w-full pb-2">
					<input type="text" value={searchQuery} onChange={(e:any) => { updateSearchQuery(e.target.value) }} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full h-full" placeholder="Search Username" />
					<div className={`absolute bg-white border border-gray-300 p-3 mt-2 rounded-lg w-full flex flex-col gap-1 ${searchOpen ? "" : "hidden"}`}>
						{searchResults.length < 1 && <p className="text-gray-400 text-center">No results found</p>} 
						{searchResults.map((u: any) => {
							return (<button key={u.username} onClick={() => { updateSearchFilter(u.username) }} className="flex flex-row gap-3 flex-wrap rounded-xl bg-white hover:bg-gray-100 items-center p-2">
								<img src={u.thumbnail} className="w-10 h-10 rounded-full bg-primary" />
								<p className="font-semibold">{u.username}</p>
							</button>)
						})}
					</div>
				</div>
				)}
				
			</div>
			<div className="max-w-screen overflow-x-auto bg-white w-full rounded-xl border-1 p-3 border border-separate border-gray-300">
				<table className="min-w-full">
					<thead className="text-left text-slate-400 text-sm">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr className="font-medium" key={headerGroup.id}>
								{headerGroup.headers.map((column) => (
									<th className="font-normal px-6 py-2 hover:text-slate-200 cursor-pointer text-left" onClick={column.column.getToggleSortingHandler()} key={column.id}>{column.isPlaceholder
										? null
										: flexRender(
											column.column.columnDef.header,
											column.getContext()
										)}
									</th>
								))}

							</tr>
						))}
					</thead>
					<tbody className="">
						{table.getRowModel().rows.map(row => (
							<tr key={row.id}>
								{row.getVisibleCells().map(cell => (
									<td key={cell.id} className="px-6 py-2">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex flex-row justify-center mt-3">
				<Button classoverride="px-4 py-2 !mx-2 !ml-0 bg-primary disabled:bg-primary/50" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{"<"}</Button>
				<div className="px-4 py-2 bg-primary text-white w-fit rounded-xl">
					{table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
				</div>
				<Button classoverride="px-4 py-2 !mx-2 bg-primary disabled:bg-primary/50" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{">"}</Button>
			</div>
		</div>
	</>;
};

const Filter: React.FC<{
	data: any
	updateFilter: (column: string, op: string, value: string) => void
	deleteFilter: () => void
	ranks: {
		id: number,
		name: string,
		rank: number,
	}[]
}> = (
	{
		updateFilter,
		deleteFilter,
		data,
		ranks
	}
) => {
		const methods = useForm<{
			col: string
			op: string
			value: string,
		}>({
			defaultValues: {
				col: data.column,
				op: data.filter,
				value: data.value
			}
		});
		const { register, handleSubmit, getValues } = methods;
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
				{getValues('col').valueOf() !== 'rank' && <Input {...register('value')} label="Value" />}

				{getValues('col') === 'rank' && (

					<>
						<label className="text-gray-500 text-sm dark:text-gray-200">
							Value
						</label>
						<select  {...register('value')} className={"text-gray-600 dark:text-white rounded-lg p-2 border-2 border-gray-300  dark:border-gray-500 w-full bg-gray-50 focus-visible:outline-none dark:bg-gray-700 focus-visible:ring-tovybg focus-visible:border-tovybg"}>
							{ranks.map((rank) => (
								<option value={rank.rank} key={rank.id}>{rank.name}</option>
							))}
						</select>
					</>)}

			</FormProvider>
		)
	}

Views.layout = workspace

export default Views