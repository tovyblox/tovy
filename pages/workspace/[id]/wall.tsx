import type { pageWithLayout } from "../../../layoutTypes";
import { loginState, workspacestate } from "../../../state";
import Workspace from "../../../layouts/workspace";
import { useState } from "react";
import { useRecoilState } from "recoil";
import Button from "../../../components/button";

const Settings: pageWithLayout = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [wallMessage, setWallMessage] = useState("");

	return <div className="px-28 py-20">
		<p className="text-4xl font-bold mb-3">Welcome to the wall :D</p>
		<textarea  className="border border-[#AAAAAA] p-2.5 rounded-md w-full focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary focus-visible:outline-none placeholder-[#AAAAAA] resize-y h-16 " placeholder="Type your wall message here" onChange={(e) => setWallMessage(e.target.value)} value={wallMessage} />
		{!!wallMessage.length && <Button classoverride="mt-2" workspace>Post</Button>}

	</div>;
};

Settings.layout = Workspace;

export default Settings;
