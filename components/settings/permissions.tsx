import React, { FC, ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { Tab, Disclosure, Transition } from "@headlessui/react";
import { GetServerSideProps, NextPage } from "next";
import { IconChevronDown } from "@tabler/icons";
import Btn from "@/components/button";
import { workspacestate } from "@/state";
import { useForm } from "react-hook-form";
import { role } from "@/utils/database";
import Roles from "@/components/settings/permissions/roles";
import Users from "@/components/settings/permissions/users";
import { Role } from "noblox.js";

import { useRecoilState } from "recoil";
import axios from "axios";
type Props = {
	users: any[];
	roles: role[];
	grouproles: Role[]
};

type form = {
	permissions: string[];
	name: string;
};

const Button: FC<Props> = (props) => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [roles, setRoles] = React.useState<role[]>(props.roles);

	return (
		<div>
			<Users roles={roles} users={props.users} />
			<Roles setRoles={setRoles} roles={roles} grouproles={props.grouproles}  />
		</div>
	);
};

export default Button;
