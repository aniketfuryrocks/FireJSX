import GlobalPlugin from "../plugins/GlobalPlugin";
import Page from "../classes/Page";
import WebpackArchitect from "../architects/WebpackArchitect";
interface gParam {
    webpackArchitect?: WebpackArchitect;
    globalPlugins: GlobalPlugin[];
}
interface pParam {
    pageMap: Map<string, Page>;
}
declare type param = {
    config: {
        [key: string]: any;
    };
    rootPath: string;
} & gParam & pParam;
export declare function mapPlugin(pluginPath: string, { rootPath, pageMap, webpackArchitect, globalPlugins, config }: param): void;
export {};
