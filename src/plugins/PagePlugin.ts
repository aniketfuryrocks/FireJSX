import FireJSXPlugin, {PluginCode} from "./FireJSXPlugin";
import {JSDOM} from "jsdom";

interface OnBuildActions {
    renderPage: (path: string, content?: any, render?: boolean) => void
}

interface OnBuildInfo {
    isSSR: boolean,
    isPro: boolean,
    isExported: boolean
}

export const PagePlugMinVer = 2.0;

export default abstract class extends FireJSXPlugin {
    page: string;

    protected constructor(page: string) {
        super(2.0, PluginCode.PagePlugin);
        this.page = page;
    }

    async onBuild(actions: OnBuildActions, info: OnBuildInfo, ...extra: any) {
        // @ts-ignore
        actions.renderPage("/" + this.page.toString().substring(0, this.page.toString().lastIndexOf(".")))
    }

    onRender(dom: JSDOM) {
    }
}