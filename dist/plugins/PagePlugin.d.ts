import FireJSXPlugin from "./FireJSXPlugin";
import { JSDOM } from "jsdom";
interface OnBuildActions {
    renderPage: (path: string, content?: any, render?: boolean) => void;
}
interface OnBuildInfo {
    isSSR: boolean;
    isPro: boolean;
    isExported: boolean;
}
export declare const PagePlugMinVer = 2;
export default abstract class extends FireJSXPlugin {
    page: string;
    protected constructor(page: string);
    onBuild(actions: OnBuildActions, info: OnBuildInfo, ...extra: any): Promise<void>;
    onRender(dom: JSDOM): void;
}
export {};
