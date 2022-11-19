import React from "react";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";

import { FC } from '@/types/settingsComponent'

const Notices: FC = () => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);	


	return (
		<div className="mt-2">
			
		</div>
	);
};

export default Notices;