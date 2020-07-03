import FireJSXPlugin from "./FireJSXPlugin";
import { JSDOM } from "jsdom";
export declare const PagePlugMinVer = 1;
export default abstract class extends FireJSXPlugin {
    page: string;
    protected constructor(page: string);
    onBuild(renderPage: (path: string, content?: any, render?: boolean) => void, ...extra: any): Promise<void>;
    onRender(dom: JSDOM): void;
}
