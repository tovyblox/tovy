import { NextPage } from "next";
import type { ReactElement } from "react";

export type pageWithLayout = NextPage & {
	layout?: LayoutProps
};

export type LayoutProps = ({
	children,
}: {
	children: ReactElement
}) => ReactElement

export type LayoutComponent = NextPage & {
	Layout: LayoutProps
}



// Path: _app.tsx