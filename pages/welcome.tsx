import type { NextPage } from "next";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { Transition } from "@headlessui/react";

const Login: NextPage = ({ }) => {
	const [selectedColor, setSelectedColor] = useState("bg-[#2196f3]");
	const [selectedSlide, setSelectedSlide] = useState(0);

	const colors = [
		"bg-[#2196f3]",
		"bg-blue-500",
		"bg-red-500",
		"bg-red-700",
		"bg-green-500",
		"bg-green-600",
		"bg-yellow-500",
		"bg-orange-500",
		"bg-purple-500",
		"bg-pink-500",
		"bg-black",
		"bg-gray-500",
	];
	return (
		<div className="flex bg-infobg h-screen bg-no-repeat bg-cover bg-center">
			<p className="text-md -mt-1 text-white absolute top-4 left-4 xs:hidden md:text-6xl font-extrabold">
				Welcome <br /> to <span className="text-[#2196f3] "> Tovy </span>
			</p>
			<div
				className={`bg-white h-auto overflow-clip w-11/12 sm:w-4/6 md:3/6 xl:w-5/12 mx-auto my-auto block rounded-3xl`}
			>

				<div
					className="flex transition translate-x-[calc(var(--active)*-100%)] duration-700 "
					style={{ "--active": selectedSlide } as React.CSSProperties}
				>
					<div className="w-full shrink-0 p-6 " id="1">
						<p className="font-bold text-2xl ">Lets get started</p>
						<p className="text-md -mt-1 text-gray-500 ">
							To configure your Tovy instance, we'll need some infomation
						</p>

						<div className="mt-2">
							<label htmlFor="groupid" className="text-gray-500 text-sm">
								helo
							</label>
							<input
								placeholder="dog"
								id="groupid"
								className="text-gray-600 rounded-lg p-2 border-2 border-grey-300 w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
							/>
						</div>

						<div className="mt-7">
							<label className="text-gray-500 text-sm">Color</label>
							<div className="grid grid-cols-5 md:grid-cols-7 lg:grid-cols-11 xl:grid-cols-10 gap-y-3 mb-8 mt-2">
								{colors.map((color, i) => (
									<a
										key={i}
										onClick={() => setSelectedColor(color)}
										className={`h-12 w-12 block rounded-full transform ease-in-out ${color} ${selectedColor === color ? "border-black border-4" : ""
											}`}
									/>
								))}
							</div>
						</div>
						<div className="flex">
							<button className="border-[#2196F3] border-2 py-3 text-sm rounded-xl px-6 text-gray-600 font-bold hover:bg-blue-300 transition ">
								Documentatiom
							</button>
							<button
								onClick={() => setSelectedSlide(1)}
								className="ml-auto bg-[#2196F3] py-3 text-sm rounded-xl px-6  text-white font-bold hover:bg-blue-300 transition "
							>
								Continue
							</button>
						</div>
					</div>
					<div className="w-full shrink-0 p-6"><p className="font-bold text-2xl" id="2">Make your Tovy account</p>
						<p className="text-md -mt-1 text-gray-500 ">
							You need to create a Tovy account to continue
						</p>

						<div className="mt-2">
							<label htmlFor="groupid" className="text-gray-500 text-sm">
								Roblox username
							</label>
							<input
								placeholder="TheCakeChicken"
								id="groupid"
								className="text-gray-600 rounded-lg p-2 border-2 border-grey-300 w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
							/>
						</div>
						<div className=" mt-2">
							<label htmlFor="groupid" className="text-gray-500 text-sm">
								Password
							</label>
							<input
								id="groupid"
								type="password"
								className="text-gray-600 rounded-lg p-2 border-2 border-grey-300 w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
							/>
						</div>
						<div className="mb-7 mt-2">
							<label htmlFor="groupid" className="text-gray-500 text-sm">
								Verify password
							</label>
							<input
								id="groupid"
								type="password"
								className="text-gray-600 rounded-lg p-2 border-2 border-grey-300 w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
							/>
						</div>

						<div className="flex">
							<button
								onClick={() => setSelectedSlide(0)}
								className="bg-[#2196F3] ml-auto py-3 text-sm rounded-xl px-6 text-white font-bold hover:bg-blue-300 transition"
							>
								Back
							</button>
							<button
								onClick={() => setSelectedSlide(1)}
								className="ml-4 bg-[#2196F3] py-3 text-sm rounded-xl px-6  text-white font-bold hover:bg-blue-300 transition "
							>
								Continue
							</button>
						</div>
					</div>
				</div>

			</div>

		</div>
	);
};

export default Login;
