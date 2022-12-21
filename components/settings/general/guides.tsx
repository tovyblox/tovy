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
		const res = await axios.patch(`/api/workspace/${workspace.groupId}/settings/general/guides`, { 
			enabled: !workspace.settings.guidesEnabled
		 });
		if (res.status === 200) {
			const obj = JSON.parse(JSON.stringify(workspace), (key, value) => (typeof value === 'bigint' ? value.toString() : value));;
			obj.settings.guidesEnabled = !workspace.settings.guidesEnabled;
			setWorkspace(obj);
			triggerToast.success("Updated documents");
		} else {
			triggerToast.error("Failed to update color");
		}
	};	


	return (
		<div className="mt-2">
			<SwitchComponenet checked={workspace.settings?.guidesEnabled} onChange={() => updateColor()} label="Enabled" classoverride="mt-2"/>
		</div>
	);
};

Guide.title = "Documents";

export default Guide;