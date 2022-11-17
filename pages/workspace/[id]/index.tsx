import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Button from "@/components/button";
import Workspace from "@/layouts/workspace";
import Sessions from "@/components/home/sessions";
import { useRecoilState } from "recoil";

const Home: pageWithLayout = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);

	const widgets: {
		[key: string]: React.FC;
	} = {
		'sessions': Sessions
	}


	return <div className="px-28 py-20">
		<p className="text-4xl font-bold">Good morning, {login.displayname}</p>
		<div className="pt-10">
			{workspace.settings.widgets.map((widget, i) => {
				const Widget = widgets[widget];
				if (!Widget) return null;
				return workspace.settings.widgets.includes(widget) ? (
					<div key={widget}> <Widget /> </div>
				) : null;
			})}
		</div>

	</div>;
};

Home.layout = Workspace;

export default Home;
