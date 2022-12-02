import axios from "axios";
import React from "react";
import type toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";

import { FC } from '@/types/settingsComponent'
import Button from "@/components/button";

type props = {
	triggerToast: typeof toast;

}

const Color: FC<props> = (props) => {
	const triggerToast = props.triggerToast;
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [selected, setSelected] = React.useState<string[]>([]);

	const updateHome = async () => {
		const res = await axios.patch(`/api/workspace/${workspace.groupId}/settings/general/home`, { 
			widgets: workspace.settings.widgets,
		 });
		if (res.status === 200) {
			triggerToast.success("Updated home");
		} else {
			triggerToast.error("Failed to update home");
		}
	};

	const toggleAble: {
		[key: string]: string;
	} = {
		'Ongoing sessions': 'sessions',
		'Latest wall messages': "wall",
		'Latest documents': "documents",
	}

	const toggle = (name: string) => {
		if (workspace.settings.widgets.includes(toggleAble[name])) {
			setWorkspace({ ...workspace, settings: { ...workspace.settings, widgets: workspace.settings.widgets.filter(widget => widget !== toggleAble[name]) } });
		} else {
			setWorkspace({ ...workspace, settings: { ...workspace.settings, widgets: [...workspace.settings.widgets, toggleAble[name]] } });
		}
	}
		


	return (
		<div>
			<p> Allows you to Customize whats on your workspace home page (tiles will only be shown to people with the corrosponding permission) </p>
			<div className="">
				<div className="grid grid-cols-3 gap-y-3 gap-x-3 mt-2">
					{Object.keys(toggleAble).map((key, i) => (
						<button key={i} className={`flex flex-col bg-white rounded-md  outline-[1.4px] outline text-left px-3 py-2 hover:bg-gray-100 focus-visible:bg-gray-100 ${workspace.settings.widgets.includes(toggleAble[key]) ? 'ring-primary outline-0 ring ' : ' outline-gray-300'}`} onClick={() => toggle(key)}>
							<p className="text-2xl font-semibold">{key}</p>
						</button>
					))}
				</div>
				<Button classoverride="mt-4" onPress={() => updateHome()}> Save </Button>

			</div>
		</div>
	);
};

Color.title = "Home";

export default Color;