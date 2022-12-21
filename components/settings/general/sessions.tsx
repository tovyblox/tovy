import axios from "axios";
import React from "react";
import type toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import SwitchComponenet from "@/components/switch";
import { workspacestate } from "@/state";

import { FC } from '@/types/settingsComponent'

type props = {
	triggerToast: typeof toast;

}

const Guide: FC<props> = (props) => {
	const triggerToast = props.triggerToast;
	const [workspace, setWorkspace] = useRecoilState(workspacestate);

	const updateColor = async () => {
		const res = await axios.patch(`/api/workspace/${workspace.groupId}/settings/general/sessions`, { 
			enabled: !workspace.settings.sessionsEnabled
		 });
		if (res.status === 200) {
			const obj = JSON.parse(JSON.stringify(workspace), (key, value) => (typeof value === 'bigint' ? value.toString() : value));
			obj.settings.sessionsEnabled = !workspace.settings.sessionsEnabled;
			setWorkspace(obj);
			triggerToast.success("Updated sessions");
		} else {
			triggerToast.error("Failed to update color");
		}
	};	


	return (
		<div className="">
			<p className="mb-2"> Sessions are a powerful way to keep track of your groups sessions & shifts</p>
			<SwitchComponenet checked={workspace.settings?.sessionsEnabled} onChange={() => updateColor()} label="Enabled" classoverride="mt-2"/>
		</div>
	);
};

Guide.title = "Sessions";

export default Guide;