import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Workspace from "@/layouts/workspace";
import { useState } from "react";
import { useRecoilState } from "recoil";
import Button from "@/components/button";

const Settings: pageWithLayout = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [wallMessage, setWallMessage] = useState("");

	return <div className="px-28 py-20">
		<p className="text-4xl font-bold mb-5">Tovy wall</p>
		<textarea className="border border-[#AAAAAA] p-2.5 rounded-md w-full focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary focus-visible:outline-none placeholder-[#AAAAAA] resize-y h-16 " placeholder="Type your wall message here" onChange={(e) => setWallMessage(e.target.value)} value={wallMessage} />
		{!!wallMessage.length && <Button classoverride="mt-2" workspace>Post</Button>}
		<div className="flex flex-col gap-2 mt-3">
			<div className="bg-white p-4 rounded-md">
				<div className="flex"> <img src="https://tr.rbxcdn.com/6bd2862461a5c2d84da136cf2c33db3f/60/60/AvatarHeadshot/.png" className="rounded-full h-12 w-12 my-auto bg-primary" /> <p className="font-semibold ml-2 break-normal leading-5 my-auto"> ItsWHOOOP <br /> <span className="text-gray-500/75 font-normal"> 18 Dec </span></p></div>
				<p className="pt-2 font-medium"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc laoreet ante et malesuada blandit. Donec pulvinar porta urna scelerisque mattis.
					Maecenas vel pharetra dui.  </p>
			</div>
		</div>
	</div>;
};

Settings.layout = Workspace;

export default Settings;
