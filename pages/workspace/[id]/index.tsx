import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Workspace from "@/layouts/workspace";
import Sessions from "@/components/home/sessions";
import Docs from "@/components/home/docs";
import randomText from "@/utils/randomText";
import wall from "@/components/home/wall";
import { useRecoilState } from "recoil";
import { useMemo } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { withSessionSsr } from "@/lib/withSession";

const Home: pageWithLayout = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const text = useMemo(() => randomText(login.displayname), []);

	const widgets: {
		[key: string]: React.FC;
	} = {
		'wall': wall,
		'sessions': Sessions,
		'documents': Docs,
		
		
	}


	return <div className="pagePadding">
		<p className="text-4xl font-bold">{text}</p>
		<div className="pt-10">
			{workspace.settings.widgets.map((widget, i) => {
				const Widget = widgets[widget];
				if (!Widget) return null;
				return workspace.settings.widgets.includes(widget) ? (
					<div key={widget} className="mb-5"> <Widget /> </div>
				) : null;
			})}
		</div>

	</div>;
};

Home.layout = Workspace;

export default Home;
