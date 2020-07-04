import GlobalPlugin from "../plugins/GlobalPlugin";
import Page from "../classes/Page";
import WebpackArchitect from "../architects/WebpackArchitect";
interface gParam {
    webpackArchitect?: WebpackArchitect;
    globalPlugins: GlobalPlugin[];
}
interface mParam extends gParam {
    rootPath: string;
    pageMap: Map<string, Page>;
}
export declare function mapPlugin(pluginPath: string, { rootPath, pageMap, webpackArchitect, globalPlugins }: mParam): void;
export {};
