import Activity from "@/components/profile/activity";
import Book from "@/components/profile/book";
import Notices from "@/components/profile/notices";
import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import { Tab } from "@headlessui/react";
import { InferGetServerSidePropsType } from "next";
import { useRecoilState } from "recoil";

export const getServerSideProps = async () => {
	return {
		props: {
			
		}
	};
}

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Profile: pageWithLayout<pageProps> = () => {
	const [login, setLogin] = useRecoilState(loginState)

	return <div className="px-28 py-20">
		<div className="flex items-center mb-6">
			<img src="https://tr.rbxcdn.com/6bd2862461a5c2d84da136cf2c33db3f/60/60/AvatarHeadshot/Png" className="rounded-full bg-primary h-16 w-16 my-auto" alt="Avatar Headshot" />
			<div className="ml-3">
				<h2 className="text-4xl font-bold">WHOOOP</h2>
				<p className="text-gray-500">@ItsWHOOOP</p>
			</div>
		</div>
		<Tab.Group>
			<Tab.List className="flex py-1 space-x-4">
			<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Activity
				</Tab>
				<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Userbook
				</Tab>
				<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Notices
				</Tab>
			</Tab.List>
			
			<Tab.Panels>
				<Tab.Panel>
					<Activity test="ok" />
				</Tab.Panel>
				<Tab.Panel>
					<Book />
				</Tab.Panel>
				<Tab.Panel>
					<Notices />
				</Tab.Panel>
			</Tab.Panels>
		</Tab.Group>
	</div>;
}

Profile.layout = workspace

export default Profile