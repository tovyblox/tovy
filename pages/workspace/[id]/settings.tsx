import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import { IconChevronDown } from "@tabler/icons";
import { Tab, Disclosure, Transition } from "@headlessui/react";
import Workspace from "@/layouts/workspace";
import { useRecoilState } from "recoil";

const Settings: pageWithLayout = () => {
	const [login, setLogin] = useRecoilState(loginState);

	return <div className="px-28 py-20">
		<p className="text-4xl font-bold">Settings</p>
		<a className=""> Tab </a>
		<Tab.Group>
			<Tab.List className="flex py-1 space-x-4">
				<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					General
				</Tab>
				<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Permission
				</Tab>
				<Tab className={({ selected }) =>
					`w-1/3 text-lg rounded-lg border-[#AAAAAA] border leading-5 font-medium text-left p-3 px-2 transition ${selected ? "bg-gray-200 hover:bg-gray-300" : "  hover:bg-gray-300"
					}`
				}>
					Ranking
				</Tab>
			</Tab.List>
			<Tab.Panels>
				<Tab.Panel>
					<Disclosure as="div" className="bg-white p-6 rounded-lg mt-2 ">
						<Disclosure.Button as="div" className="text-2xl font-medium cursor-pointer flex " >Is team pricing available? <IconChevronDown color="#AAAAAA" className="ml-auto" /></Disclosure.Button>

						<Transition
							enter="transition duration-100 ease-out"
							enterFrom="transform scale-95 opacity-0"
							enterTo="transform scale-100 opacity-100"
							leave="transition duration-75 ease-out"
							leaveFrom="transform scale-100 opacity-100"
							leaveTo="transform scale-95 opacity-0"
						>
							<Disclosure.Panel>
								Yes! You can purchase a license that you can share with your entire
								team.
							</Disclosure.Panel>
						</Transition>
					</Disclosure>
				</Tab.Panel>
			</Tab.Panels>
		</Tab.Group>

	</div>;
};

Settings.layout = Workspace;

export default Settings;
