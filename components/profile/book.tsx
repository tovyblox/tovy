import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";

import { FC } from '@/types/settingsComponent'
import { Listbox } from "@headlessui/react";
import Button from "../button";

const types = ["Warning", "Promotion", "Suspension", "Fired"]

const Book: FC = () => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);	
	const [message, setMessage] = useState("");
	const [type, setType] = useState(types[0]);

	return (
		<div className="mt-2">
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

			{!!message.length && <Button classoverride="mt-2 w-24" workspace>Send</Button>}

			<div className="flex flex-col gap-2 mt-3">
				<div className="bg-white p-4 rounded-md">
					<div className="flex">
						<div className="flex items-center mb-2">
							<img src="https://tr.rbxcdn.com/6bd2862461a5c2d84da136cf2c33db3f/60/60/AvatarHeadshot/Png" className="rounded-full h-10 w-10 my-auto bg-primary" alt="Avatar Headshot" />
							<div className="ml-3">
								<h2 className="font-bold text-sm">WHOOOP (@ItsWHOOOP)</h2>
								<p className="font-semibold text-red-500 text-sm">Warning #1</p>
							</div>
						</div>
					</div>
					<p className="font-medium">You were being stupid</p>
				</div>
			</div>
		</div>
	);
};

export default Book;