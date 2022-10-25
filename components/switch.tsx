import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { workspacestate } from "@/state";
import { useRecoilState } from "recoil";
import { Switch } from "@headlessui/react";
type Props = {
	onChange?: () => void;
	label: string;
	classoverride?: string;
	disabled?: boolean | false;
	checked?: boolean | false;

};

const SwitchComponenet: FC<Props> = ({ disabled, onChange, label, checked }: Props) => {
	return (
		<div className="flex flex-row">
			<Switch
				checked={checked}
				className={`${checked ? 'bg-primary' : 'bg-gray-200'
					} relative inline-flex h-6 w-11 items-center rounded-full shadow-inner mb-2`}
				onChange={onChange}
			>
				<span
					className={`${checked ? 'translate-x-6' : 'translate-x-1'
						} inline-block h-4 w-4 transform rounded-full bg-white transition shadow`}
				/>
			</Switch>
			<p className="ml-2">{label}</p>
		</div>

	);
};

export default SwitchComponenet;
