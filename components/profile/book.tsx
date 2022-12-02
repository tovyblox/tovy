import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import { FC } from '@/types/settingsComponent'
import axios from "axios";
import { Listbox } from "@headlessui/react";
import Button from "../button";
import { userBook, Prisma } from "@prisma/client";
import { getDisplayName } from "@/utils/userinfoEngine";
import {useRouter} from "next/router";

const types = ["Warning", "Promotion", "Suspension", "Fired"]

type UserBookWithAdmin = Prisma.userBookGetPayload<{
	include: { admin: true }
}>

type Props = {
	userBook: UserBookWithAdmin[];
}

const Book: FC<Props> = ({ userBook }) => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);	
	const [message, setMessage] = useState("");
	const [type, setType] = useState(types[0]);
	const [book, setBook] = useState(userBook || []);
	const router = useRouter();

	//make a function that makes the first char uppercase
	const capitalize = (str: string) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	const sendBook = async () => {
		const req = await axios.post(`/api/workspace/${workspace.groupId}/userbook/${router.query.uid}/new`, {
			notes: message,
			type: type.toLocaleLowerCase()
		});
		setBook([...book, req.data.log]);
		setMessage("");
	}
		

	return (
		<div className="mt-2">
			<div className="grid grid-rows-1 grid-cols-2 gap-2 mb-4">
				<div className="bg-white p-4 rounded-md">
					<p className="font-medium text-xl leading-4 mt-1 text-gray-400">Warnings</p>
					<p className="mt-3 text-8xl font-extralight">{userBook.filter(b => b.type === "warning").length}</p>
				</div>
				<div className="bg-white p-4 rounded-md">
					<p className="font-medium text-xl leading-4 mt-1 text-gray-400">Promotions</p>
					<p className="mt-3 text-8xl font-extralight">{userBook.filter(b => b.type === "promotion").length}</p>
				</div>
			</div>

			<hr className="mb-4" />

			<textarea className="border border-[#AAAAAA] p-2.5 rounded-md w-full focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary focus-visible:outline-none placeholder-[#AAAAAA] resize-y h-16 " placeholder="Type your message" onChange={(e) => setMessage(e.target.value)} value={message} />
			<Listbox value={type} onChange={setType}>
				<Listbox.Button className="h-auto pr-36 mt-2 flex flex-row rounded-md py-2 bg-white hover:bg-gray-200 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800 px-2 transition cursor-pointer outline-1 outline-gray-300 outline mb-1 focus-visible:bg-gray-200">
					<p className="my-auto text-xl pl-2 font-medium">
						{type}
					</p>
				</Listbox.Button>
				<Listbox.Options className="z-20 mt-2 w-56 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-300 focus-visible:outline-none overflow-clip">
					{types.map((type) => (
						<Listbox.Option
							className={({ active }) =>
							`${active ? 'text-white bg-primary' : 'text-gray-900'} cursor-pointer select-none py-2 pl-3 pr-9`
							}
							key={type}
							value={type}
						>
							{({ selected }) => (
								<>
									<div className="flex items-center">
										<span
											className={`${selected ? 'font-semibold' : 'font-normal'} block truncate text-xl`}
										>
											{type}
										</span>
									</div>
								</>
							)}
						</Listbox.Option>
					))}
				</Listbox.Options>
			</Listbox>

			{!!message.length && <Button classoverride="mt-2 w-24" workspace onPress={sendBook}>Send</Button>}

			<div className="flex flex-col gap-2 mt-3">
				{book.map((book) => (
					<div className="bg-white p-4 rounded-md" key={book.id}>
						<div className="flex">
							<div className="flex items-center mb-2">
								<img src={book.admin.picture ? book.admin.picture : undefined} className="rounded-full h-10 w-10 my-auto bg-primary" alt="Avatar Headshot" />
								<div className="ml-3">
									<h2 className="font-bold text-sm">{book.admin.username}</h2>
									<p className={`font-semibold ${book.type == "promotion" ? "text-green-500" : "text-red-500"} text-sm`}>{book.type == "fire" ? "Fired" : capitalize(book.type)}</p>
								</div>
							</div>
						</div>
						<p className="font-medium">{book.reason}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default Book;