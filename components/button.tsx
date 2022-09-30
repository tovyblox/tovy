import React, { FC, Children, ReactNode, useState, useEffect } from "react";

type Props = {
	children: ReactNode;
	onPress?: () => void;
	classoverride?: string;
	loading?: boolean | false;
};

const Button: FC<Props> = ({ children, onPress, loading, classoverride }: Props) => {
	return (
		<button
			onClick={onPress}
			className={"ml-auto bg-[#2196F3] dark:bg-white py-3 text-sm rounded-xl px-6  text-white dark:text-black font-bold hover:bg-blue-300 transition " + classoverride}
		>
			{loading ? (
				<svg
				className="animate-spin mx-auto h-5 w-5 text-white"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			) : (
				children
			)}
		</button>
	);
};

export default Button;
