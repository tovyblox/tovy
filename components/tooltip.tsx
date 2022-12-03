import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { workspacestate } from "@/state";
import { useRecoilState } from "recoil";
import { Switch } from "@headlessui/react";
type Props = {
	children?: ReactNode;
	orientation: string | "right" | "top" | "bottom" | "left";
	tooltipText?: string;
	isWorkspace?: boolean | true;


};

const Tooltip: FC<Props> = ({ children, orientation, tooltipText, isWorkspace }: Props) => {
	const tipRef = React.createRef<HTMLDivElement>();
	const orientations = {
		right: 'right',
		top: 'top',
		left: 'left',
		bottom: 'bottom',
	}

	function handleMouseEnter() {
		tipRef!.current!.style.opacity = '1'
	}

	function handleMouseLeave() {
		tipRef!.current!.style.opacity = '0'
	}

	const setContainerPosition = (orientation: string) => {
		let classnames

		switch (orientation) {
			case orientations.right:
				classnames = 'top-0 left-full ml-4'
				break
			case orientations.left:
				classnames = 'top-0 right-full mr-4'
				break
			case orientations.top:
				classnames = 'bottom-full left-[50%] translate-x-[-50%] -translate-y-2'
				break
			case orientations.bottom:
				classnames = 'top-full left-[50%] translate-x-[-50%] translate-y-2'
				break

			default:
				break
		}

		return classnames
	}

	const setPointerPosition = (orientation: string) => {
		let classnames

		switch (orientation) {
			case orientations.right:
				classnames = 'left-[-6px]'
				break
			case orientations.left:
				classnames = 'right-[-6px]'
				break
			case orientations.top:
				classnames = 'top-full left-[50%] translate-x-[-50%] -translate-y-2'
				break
			case orientations.bottom:
				classnames = 'bottom-full left-[50%] translate-x-[-50%] translate-y-2'
				break

			default:
				break
		}

		return classnames
	}

	const classContainer = `w-max absolute z-50 ${setContainerPosition(
		orientation
	)} ${isWorkspace ? 'bg-primary' : 'bg-tovybg'} text-white text-sm px-3 py-2 rounded-xl flex items-center transition-all duration-150 pointer-events-none`

	const pointerClasses = `${isWorkspace ? 'bg-primary' : 'bg-tovybg'} h-3 w-3 absolute z-10 ${setPointerPosition(
		orientation
	)} rotate-45 pointer-events-none`

	return (
		<div className="relative flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			<div className={classContainer} style={{ opacity: 0 }} ref={tipRef}>
				<div className={pointerClasses} />
				{tooltipText}
			</div>
			{children}
		</div>
	)
};

export default Tooltip;
