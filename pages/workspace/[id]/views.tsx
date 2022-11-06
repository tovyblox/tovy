import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import axios from "axios";
import { InferGetServerSidePropsType } from "next";
import { useRecoilState } from "recoil";

export const getServerSideProps = async () => {
	const { data: group } = await axios.get(`https://groups.roblox.com/v1/groups/2700627`);

	const { data: { previousPageCursor, nextPageCursor, data: users } } = await axios.get(`https://groups.roblox.com/v1/groups/2700627/users?sortOrder=Asc&limit=25`);
	const pages = Math.abs(Math.round(group.memberCount / 25));
	const computedUsers: any[] = [];

	users.forEach(({ user, role }: any) => {
		computedUsers.push({
			userId: user.userId,
			username: user.username,
			displayName: user.displayName,
			role: {
				name: role.name,
				rank: role.rank
			}
		})
	});

	return {
		props: {
			usersInGroup: computedUsers,
			pages,
		}
	};
}

type pageProps = InferGetServerSidePropsType<typeof getServerSideProps>
const Views: pageWithLayout<pageProps> = ({ usersInGroup, pages }) => {
	const [login, setLogin] = useRecoilState(loginState)

	return <div className="px-28 py-20">
		<p>{pages}</p>
		<pre>{JSON.stringify(usersInGroup, null, 4)}</pre>
	</div>;
}

Views.layout = workspace

export default Views