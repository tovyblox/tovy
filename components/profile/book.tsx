import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";

import { FC } from '@/types/settingsComponent'
import { Listbox } from "@headlessui/react";

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
		</div>
	);
};

export default Book;