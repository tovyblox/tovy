import axios from "axios";
import React, { useEffect } from "react";
import type toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import Button from "@/components/button";
import Input from "@/components/input_noform";
import { useRouter } from "next/router";
import { workspacestate } from "@/state";

import { FC } from '@/types/settingsComponent'

type props = {
	triggerToast: typeof toast;

}

const Color: FC<props> = (props) => {
	const triggerToast = props.triggerToast;
	const router = useRouter();
	const [count, setCount] = React.useState(0);

	useEffect(() => {
		const getCount = async () => {
			const res = await axios.get(`/api/workspace/${router.query.id}/settings/general/ally`);
			setCount(res.data.count);
		};
		getCount();
	}, []);

	const updateAllyCount = async (count: number) => {
		const res = axios.patch(`/api/workspace/${router.query.id}/settings/general/ally`, { count });
		
		triggerToast.promise(res, {
			loading: "Updating ally count",
			success: "Updated ally count",
			error: "Failed to update ally count"
		});
	};


	return (
		<div className="z-10 relative">
			<Input type="number" value={count} onChange={(e) => setCount(parseInt(e.target.value))} label="Minimum rep count" placeholder="1"/>
			<Button onClick={() => updateAllyCount(count)}  classoverride="mt-2"> Save</Button>
		</div>
	);
};

Color.title = "Ally";

export default Color;