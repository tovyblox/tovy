import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { loginState } from "@/state";
import { useRecoilState } from "recoil";
import { useForm, FormProvider } from "react-hook-form";
import Router from "next/router";
import Slider from "@/components/slider";
import Input from "@/components/input";
import axios from "axios";
type FormData = {
	username: string;
	password: string;
	verifypassword: string;
};
const Login: NextPage = ({ }) => {
	const [selectedColor, setSelectedColor] = useState("bg-[#2196f3]");
	const [login, setLogin] = useRecoilState(loginState);
	const methods = useForm<{groupid: String}>();
	const signupform = useForm<FormData>();
	const { register, handleSubmit, watch, formState: { errors } } = methods;
	const [selectedSlide, setSelectedSlide] = useState(0);

	useEffect(() => {
		if(login.workspaces) Router.push("/");
	}, []);

	async function createAccount() {
		let request
		try {
			request = await axios.post('/api/setupworkspace', {
				groupid: methods.getValues("groupid"),
				username: signupform.getValues("username"),
				password: signupform.getValues("password"),
				color: selectedColor,
			})
		}
		catch (e: any) {
			if (e?.response?.status === 404) {
				signupform.setError("username", { type: "custom", message: e.response.data.error })
				return;
			}
		}
		finally {
			if (!request) return;
			setTimeout(() => {
				Router.push("/")
				Router.reload()
			}, 1000)
		}
	}

	const nextSlide = () => {
		setSelectedSlide(selectedSlide + 1);
	};

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
			<Slider activeSlide={selectedSlide}>
				<div>
					<p className="font-bold text-2xl ">Let's get started</p>
					<p className="text-md -mt-1 text-gray-500 dark:text-gray-200">
						To configure your Tovy instance, we'll need some infomation
					</p>
					<FormProvider {...methods}>
						<form className="mt-2" onSubmit={handleSubmit(nextSlide)}>
							<Input
								placeholder="5468933"
								label="Group ID"
								id="groupid"
								{...register("groupid", { required: { value: true, message: "This field is required" } })}
							/>
						</form>
					</FormProvider>

					<div className="mt-7">
						<label className="text-gray-500 text-sm dark:text-gray-200">Color</label>
						<div className="grid grid-cols-5 md:grid-cols-7 lg:grid-cols-11 xl:grid-cols-10 gap-y-3 mb-8 mt-2">
							{colors.map((color, i) => (
								<a
									key={i}
									onClick={() => setSelectedColor(color)}
									className={`h-12 w-12 block rounded-full transform ease-in-out ${color} ${selectedColor === color ? "border-black border-4 dark:border-white" : ""
										}`}
								/>
							))}
						</div>
					</div>
					<div className="flex">
						<button className="border-[#2196F3] border-2 py-3 text-sm rounded-xl px-6 text-gray-600 dark:text-white font-bold hover:bg-blue-300 dark:hover:bg-blue-400 transition ">
							Documentation
						</button>
						<button
							onClick={handleSubmit(nextSlide)}
							className="ml-auto bg-[#2196F3] py-3 text-sm rounded-xl px-6  text-white font-bold hover:bg-blue-300 transition "
						>
							Continue
						</button>
					</div>
				</div>
				<div >
					<p className="font-bold text-2xl" id="2">
						Make your Tovy account
					</p>
					<p className="text-md -mt-1 text-gray-500 dark:text-gray-200">
						You need to create a Tovy account to continue
					</p>
					<FormProvider {...signupform}>
					   <Input  {...signupform.register("username")} label="Username" />
						<Input type="password" {...signupform.register("password", { required: { value: true, message: "You must enter a password, silly" } })} label="Password" />
						<Input type="password" {...signupform.register("verifypassword", { required: { value: true, message: "This field is required"}, validate: { checkpassword: (d) => d === signupform.getValues('password') || 'Passwords must match' }})} label="Verify password" />
					</FormProvider>

					<div className="mt-7 flex">
						<button
							onClick={() => setSelectedSlide(0)}
							className="bg-[#2196F3] ml-auto py-3 text-sm rounded-xl px-6 text-white font-bold hover:bg-blue-300 transition"
						>
							Back
						</button>
						<button
							onClick={signupform.handleSubmit(createAccount)}
							className="ml-4 bg-[#2196F3] py-3 text-sm rounded-xl px-6  text-white font-bold hover:bg-blue-300 transition "
						>
							Continue
						</button>
					</div>
				</div>
			</Slider>
		</div>
	);
};

export default Login;
