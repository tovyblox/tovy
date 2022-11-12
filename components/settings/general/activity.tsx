import axios from "axios";
import React, { useEffect } from "react";
import type toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import SwitchComponenet from "@/components/switch";
import { workspacestate } from "@/state";
import Button from "@/components/button";

import { FC } from '@/types/settingsComponent'

type props = {
	triggerToast: typeof toast;

}

const Activity: FC<props> = (props) => {
	const triggerToast = props.triggerToast;
	const [workspace, setWorkspace] = useRecoilState(workspacestate);

	useEffect(() => {

	}, []);

	const downloadLoader = async () => {
		window.open(`/api/workspace/${workspace.groupId}/settings/activity/download`);
	}


	return (
		<div className="">
			<p className="mb-2"> Sessions are a powerful way to keep track of your groups sessions & shifts</p>
			<Button onPress={downloadLoader}>
				Download loader
			</Button>
		</div>
	);
};

Activity.title = "Activity";

export default Activity;