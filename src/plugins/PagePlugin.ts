import FireJSXPlugin, {PluginCode} from "./FireJSXPlugin";
import {JSDOM} from "jsdom";

export const PagePlugMinVer = 1.0;

export default abstract class extends FireJSXPlugin {
    page: string;

    protected constructor(page: string) {
        super(1.0, PluginCode.PagePlugin);
        this.page = page;
    }

    onBuild(renderPage: (path: string, content?: any, render?: boolean) => void, ...extra: any) {
        renderPage("/" + this.page.toString().substring(0, this.page.toString().lastIndexOf(".")))
    }

    onRender(dom: JSDOM) {
    }
}