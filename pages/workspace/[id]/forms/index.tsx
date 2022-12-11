import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import { loginState } from "@/state";
import { getDisplayName, getUsername, getThumbnail } from "@/utils/userinfoEngine";
import { ActivitySession } from "@prisma/client";
import prisma from "@/utils/database";
import { useRecoilState } from "recoil";

export const getServerSideProps = withPermissionCheckSsr(
	async ({ query, req }) => {
		return {
			props: {}
		}
	}
)

type pageProps = {}
const Profile: pageWithLayout<pageProps> = () => {
	const [login, setLogin] = useRecoilState(loginState)

	return <div className="pagePadding">
		<p>ok guys welcome to forms</p>
	</div>;
}

Profile.layout = workspace

export default Profile