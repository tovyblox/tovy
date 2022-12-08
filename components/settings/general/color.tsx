import axios from "axios";
import React from "react";
import type toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";

import { FC } from '@/types/settingsComponent'

type props = {
	triggerToast: typeof toast;

}

const Color: FC<props> = (props) => {
	const triggerToast = props.triggerToast;
	const [workspace, setWorkspace] = useRecoilState(workspacestate);

	const updateColor = async (color: string) => {
		const res = await axios.patch(`/api/workspace/${workspace.groupId}/settings/general/color`, { color });
		if (res.status === 200) {
			setWorkspace({ ...workspace, groupTheme: color });
			triggerToast.success("Updated color");
		} else {
			triggerToast.error("Failed to update color");
		}
	};	



	const colors = [
		"bg-[#2196f3]",
		"bg-blue-500",
		"bg-red-500",
		"bg-red-700",
		"bg-green-500",
		"bg-green-600",
		"bg-yellow-500",
		"bg-orange-500",
		"bg-purple-500",
		"bg-pink-500",
		"bg-black",
		"bg-gray-500",
	];
		

	return (
		<div className="z-10 relative">
			<p> Color </p>
			<div className="rounded-xl grid grid-cols-5 md:grid-cols-7 lg:grid-cols-11 xl:grid-cols-12 gap-y-3 mb-2 mt-2 bg-white ">
              {colors.map((color, i) => (
                <a
                  key={i}
                  onClick={() => updateColor(color)}
                  className={`h-12 w-12 block rounded-full transform ease-in-out ${color} ${workspace.groupTheme === color ? "border-black border-4 dark:border-white" : ""
                    }`}
                />
              ))}
            </div>
		</div>
	);
};

Color.title = "Customize";

export default Color;