import { FC, MutableRefObject, useEffect } from "react";
import Button from "../button";

type Props = {}

const FormList: FC<Props> = () => {
	return <div className="cardBtn !m-0 !px-4 !py-3 hover:!opacity-100 hover:!bg-white">
		<div className="flex flex-col sm:flex-row sm:items-center">
			<div className="flex-1 mb-2 sm:mb-0">
				<p className="text-2xl font-bold">MR Application</p>
				<p className="text-gray-400 font-normal text-base">An application to be a middle ranking member at Tovy.</p>
			</div>
			<div className="space-y-2 sm:space-x-2 sm:space-y-0">
				<Button classoverride="font-semibold w-full sm:w-fit">Edit</Button>
				<Button classoverride="bg-red-600 hover:bg-red-300 focus-visible:bg-red-300 font-semibold w-full sm:w-fit">Delete</Button>
			</div>
		</div>
	</div>
}

export default FormList;