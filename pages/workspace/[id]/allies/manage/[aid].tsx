import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import axios from "axios";
import { useRouter } from "next/router";
import { getConfig } from "@/utils/configEngine";
import { useState, Fragment, useMemo, useRef, useEffect } from "react";
import randomText from "@/utils/randomText";
import { useRecoilState } from "recoil";
import toast, { Toaster } from 'react-hot-toast';
import Button from "@/components/button";
import { InferGetServerSidePropsType } from "next";
import { withSessionSsr } from "@/lib/withSession";
import moment from "moment";
import { Dialog, Transition } from "@headlessui/react";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Input from "@/components/input";
import prisma, { inactivityNotice } from "@/utils/database";
import { getUsername, getThumbnail } from "@/utils/userinfoEngine";
import Image from 'next/image'
import Checkbox from "@/components/checkbox";
import Tooltip from "@/components/tooltip";


export const getServerSideProps = withPermissionCheckSsr(
	async ({ req, res, params }) => {
		let users = await prisma.user.findMany({
			where: {
				OR: [
					{
						roles: {
							some: {
								workspaceGroupId: parseInt(params?.id as string),
								permissions: {
									has: 'admin'
								}
							}
						}
					},
					{
						roles: {
							some: {
								workspaceGroupId: parseInt(params?.id as string),
								permissions: {
									has: 'represent_alliance'
								}
							}
						}
					},
					{
						roles: {
							some: {
								workspaceGroupId: parseInt(params?.id as string),
								permissions: {
									has: 'manage_alliances'
								}
							}
						}
					}
				]
			}
		});
		const infoUsers: any = await Promise.all(users.map(async (user: any) => {
			return {
				...user,
				userid: Number(user.userid),
				thumbnail: await getThumbnail(user.userid)
			}
		}))

		const ally: any = await prisma.ally.findUnique({
			where: {
				id: String(params?.aid)
			},
			include: {
				reps: true
			}
		})

		if(ally == null) {
			res.writeHead(302, {
				Location: `/workspace/${params?.id}/allies`
			})
			res.end()
			return
		}

		const infoReps = await Promise.all(ally.reps.map(async (rep: any) => {
			return {
				...rep,
				userid: Number(rep.userid),
				username: await getUsername(rep.userid),
				thumbnail: await getThumbnail(rep.userid)
			}
		}))

		let infoAlly = ally
		infoAlly.reps = infoReps
		// @ts-ignore
		const visits = await prisma.allyVisit.findMany({
			where: {
				// @ts-ignore
				allyId: params?.aid
			},
		})

		const infoVisits = await Promise.all(visits.map(async(visit: any) => {
			return {
				...visit,
				hostId: Number(visit.hostId),
				hostUsername: await getUsername(visit.hostId),
				hostThumbnail: await getThumbnail(visit.hostId),
				time: new Date(visit.time).toISOString()

			}
		}))

		return {
			props: {
				infoUsers,
				infoAlly,
				infoVisits
			}
		}
	})

	type Notes = {
		content: string
	}

	type Rep = {
		userid: number
	}

	type Visit = {
		name: string,
		time: Date
	}

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const ManageAlly: pageWithLayout<pageProps> = (props) => {
	const router = useRouter();
	const { id } = router.query;
	const [login, setLogin] = useRecoilState(loginState);
	const text = useMemo(() => randomText(login.displayname), []);
	const ally: any = props.infoAlly
	const users: any = props.infoUsers
	const visits: any = props.infoVisits

	const form = useForm();
	const { register, handleSubmit, setError, watch } = form;

	const [reps, setReps] = useState(ally.reps.map((u: any) => { return u.userid }))

	const handleCheckboxChange = (event: any) => {
		const { value } = event.target
		let numberVal = parseInt(value)
		if(reps.includes(numberVal)) {
			setReps(reps.filter((r: any) => r !== numberVal))
		} else {
			setReps([...reps, numberVal])
		}
	}

	const saveNotes = async () => {
		const axiosPromise = axios.patch(
			`/api/workspace/${id}/allies/${ally.id}/notes`,
			{ notes: notes }
		).then(req => {
		});
		toast.promise(
			axiosPromise,
			{
				loading: "Updating notes...",
				success: () => {
					return "Notes updated!";
				},
				error: "Notes were not saved due to an unknown error."
			}
		);
	}
	const [notes, setNotes] = useState(ally.notes || [""])
	const [editNotes, setEditNotes] = useState<any[]>([])

	const updateReps = async () => {
		const axiosPromise = axios.patch(
			`/api/workspace/${id}/allies/${ally.id}/reps`,
			{ reps: reps }
		).then(req => {
		});
		toast.promise(
			axiosPromise,
			{
				loading: "Updating reps...",
				success: () => {
					return "Reps updated!";
				},
				error: "Reps were not saved due to an unknown error."
			}
		);
	}

	const [isOpen, setIsOpen] = useState(false);
	const [isEditOpen, setEditOpen] = useState(false);

	const [editContent, setEditContent] = useState({ name: '', time: '', id: '' })

	const colors = [
		'bg-red-500',
		'bg-yellow-500',
		'bg-green-500',
		'bg-blue-500',
		'bg-indigo-500',
		'bg-purple-500',
		'bg-pink-500',
	]

	const getRandomColor = () => {
		return colors[Math.floor(Math.random() * colors.length)];
	}

	const updateNoteValue = (event: any, index: any) => {
		let updateNote = [...notes]
		updateNote[index] = event.target.value
		setNotes(updateNote)
		return event.target.value
	}

	const createNote = () => {
		setNotes([...notes, "This note is empty!"])
	}

	const deleteNote = (index: any) => {
		const noteClone = [...notes]
		noteClone.splice(index, 1)
		setNotes(noteClone)
	}

	const noteEdit = (index: any) => {
		if(editNotes.includes(index)) {
			const newEdits = editNotes.filter(n => n !== index)
			setEditNotes(newEdits)
		} else {
			setEditNotes([...editNotes, index])
		}
	}
	const visitform = useForm<Visit>()

	const createVisit: SubmitHandler<Visit> = async({ name, time }) => {
		const axiosPromise = axios.post(
			`/api/workspace/${id}/allies/${ally.id}/visits`,
			{ name: name, time: time }
		).then(req => {
		});
		toast.promise(
			axiosPromise,
			{
				loading: "Creating visit...",
				success: () => {
					router.reload()
					return "Visit created!";
				},
				error: "Visit was not created due to an unknown error."
			}
		);
	}

	const editVisit = async (visitId: any, visitName: any) => {
		setEditOpen(true)
		setEditContent({...editContent, name: visitName, id: visitId })
	}

	const updateVisit = async () => {
		const axiosPromise = axios.patch(
			`/api/workspace/${id}/allies/${ally.id}/visits/${editContent.id}`,
			{ name: editContent.name, time: editContent.time }
		).then(req => {
		});
		toast.promise(
			axiosPromise,
			{
				loading: "Updating visit...",
				success: () => {
					router.reload()
					return "Visit updated!";
				},
				error: "Visit was not updated due to an unknown error."
			}
		);
	}

	const deleteVisit = async (visitId: any) => {
		const axiosPromise = axios.delete(
			`/api/workspace/${id}/allies/${ally.id}/visits/${visitId}`
		).then(req => {
		});
		toast.promise(
			axiosPromise,
			{
				loading: "Deleting visit...",
				success: () => {
					router.reload()
					return "Visit deleted!";
				},
				error: "Visit was not deleted due to an unknown error."
			}
		);
	}

	return <>
		<Toaster position="bottom-center" />

		{/* create visit modal */}

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

				<div className="fixed inset-0 overflow-y-auto">
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
								<Dialog.Title as="p" className="my-auto text-2xl font-bold">Create alliance visit</Dialog.Title>

								<div className="mt-2">
									<FormProvider {...form}>
										{/* @ts-ignore */}
										<form onSubmit={handleSubmit(createVisit)}>
											<Input label="Visit Title" {...register("name")} />
											<Input label="Visit Time" type="datetime-local" {...register("time")} />
											<input type="submit" className="hidden" />
										</form>
									</FormProvider>
								</div>

								<div className="mt-4 flex">
									<Button classoverride="bg-red-500 hover:bg-red-300 ml-0" onPress={() => setIsOpen(false)}> Cancel </Button>
									{/* @ts-ignore */}
									<Button classoverride="" onPress={handleSubmit(createVisit)}> Submit </Button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>

		{/* edit visit modal */}

		<Transition appear show={isEditOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={() => setEditOpen(false)}>
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

				<div className="fixed inset-0 overflow-y-auto">
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
								<Dialog.Title as="p" className="my-auto text-2xl font-bold">Edit alliance visit</Dialog.Title>

								<div className="mt-2">
									<FormProvider {...form}>
										<form>
											{/* @ts-ignore */}
											<Input label="Visit Title" value={editContent.name} onChange={(e) => { setEditContent({ ...editContent, name: e.target.value }) }} />
											{/* @ts-ignore */}
											<Input label="Visit Time" value={editContent.time} onChange={(e) => { setEditContent({ ...editContent, time: e.target.value }) }} type="datetime-local" />
											<input type="submit" className="hidden" />
										</form>
									</FormProvider>
								</div>

								<div className="mt-4 flex">
									<Button classoverride="bg-red-500 hover:bg-red-300 ml-0" onPress={() => setEditOpen(false)}> Cancel </Button>
									<Button classoverride="" onPress={() => {updateVisit()}}> Submit </Button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>

		<div className="pagePadding space-y-4">
			<p className="text-4xl font-bold">{text}</p>
			<div className="flex flex-row gap-4 flex-wrap items-center">
				<img src={ally.icon} className="w-16 h-16 rounded-full" />
				<div className="flex flex-col">
					<h2 className="font-bold text-3xl leading-tight">{ally.name}</h2>
					<div className="flex flex-row ml-[15px]">
					{ally.reps.map((rep: any) => {
								return (<div className="ml-[-15px]" key={rep.userid}>
								<Tooltip orientation="top" tooltipText={rep.username}>
									<img src={rep.thumbnail} className="w-12 h-12 rounded-full bg-primary z-0 hover:z-50 hover:shadow-xl border-4 border-gray-100"></img>
								</Tooltip>
							</div>)
							})}
					</div>
				</div>
			</div>
			
			<p className="text-gray-500 text-sm dark:text-gray-200">Notes</p>

			<FormProvider {...form}>
				{/* @ts-ignore */}
				<div className="flex flex-col gap-4">
					{notes.map((note: any, index: any) => {
						return(<div key={index} className="bg-white p-4 rounded-md ring-1 ring-gray-300">
							<p className={`mb-4 ${editNotes.includes(index) ? "hidden" : null}`}>{notes[index]}</p>
								<div className={editNotes.includes(index) ? "" : "hidden"}>
									{/* @ts-ignore */}
									<Input textarea value={notes[index]} onChange={(e: any) => { return updateNoteValue(e, index) }}></Input>
								</div>
							<div className="flex flex-row flex-wrap gap-4">
							<Button classoverride="ml-0" onClick={() => noteEdit(index)}>{editNotes.includes(index) ? "Close Edit" : "Edit Note"}</Button>
							<Button classoverride="ml-0 bg-red-600 hover:bg-red-300" onClick={() => deleteNote(index)}>Delete Note</Button>
							</div>
						</div>
						)
					})}
				</div>
				<input type="submit" className="hidden" />
				<div className="flex flex-row gap-4">
					<Button classoverride="ml-0" onClick={() => saveNotes()}>Save Notes</Button>
					<Button classoverride="ml-0 bg-green-600 hover:bg-green-300" onClick={() => {createNote()}}>Create Note</Button>
				</div>
			</FormProvider>

			{ users.length < 1 && <p className="text-gray-500 text-sm dark:text-gray-200">Nobody has the represent alliance permissions!</p> }
			{ users.length >= 1 && <p className="text-gray-500 text-sm dark:text-gray-200">Representatives</p> }
			<div className="p-4 max-h-64 overflow-auto flex flex-col gap-4 bg-white rounded-md ring-1 ring-gray-300">
				{users.map((user: any) => {
					return (<div className="flex gap-4 items-center" key={user.userid}>
						<Checkbox value={user.userid} onChange={handleCheckboxChange} checked={reps.includes(user.userid)} />
						<img src={user.thumbnail} className="w-10 h-10 rounded-full bg-primary"></img>
						<p>{user.username}</p>
					</div>)
				})}
			</div>
			<Button onPress={() => { updateReps() }}>Save Representatives</Button>
			<button className="cardBtn" onClick={() => setIsOpen(true)}>
				<p className="font-bold text-2xl leading-5 mt-1">Create new ally visit</p>
				<p className="text-gray-400 font-normal text-base mt-1">Schedule an alliance visit for your alliance representatives to attend</p>
			</button>
			{ visits.length < 1 && <p>You haven't got any alliance visits planned, why not schedule one?</p> }
			<div className="flex flex-col gap-4">
				{visits.map((visit: any) => {
					return (
						<div key={visit.id} className="p-4 bg-white rounded-md ring-1 ring-gray-300">
							<p className="font-bold text-2xl leading-5 mt-1">{visit.name}</p>
							<div className="flex flex-row gap-4 mt-4 items-center">
								<img src={visit.hostThumbnail} className="rounded-full w-12 h-12 bg-primary" />
								<div className="flex flex-col">
									<p className="font-bold text-lg">Hosted by {visit.hostUsername}</p>
									<p>On {new Date(visit.time).toLocaleDateString()} at {new Date(visit.time).getHours().toString().padStart(2, '0')}:{new Date(visit.time).getMinutes().toString().padStart(2, '0')} </p>
								</div>
							</div>
							<div className="flex gap-4">
									<Button classoverride="bg-red-600 hover:bg-red-300" onClick={() => deleteVisit(visit.id)}>Delete</Button>
									<Button classoverride="bg-amber-600 hover:bg-amber-300 m-0" onClick={() => editVisit(visit.id, visit.name)}>Edit</Button>
								</div>
						</div>
					)
				})}
			</div>
			

		</div>

	</>;
}

ManageAlly.layout = workspace

export default ManageAlly