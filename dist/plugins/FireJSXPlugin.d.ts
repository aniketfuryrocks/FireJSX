import { WebpackConfig } from "../FireJSX";
export declare enum PluginCode {
    GlobalPlugin = 1,
    PagePlugin = 2
}
export default abstract class FireJSXPlugin {
    readonly version: any;
    readonly plugCode: any;
    config: {
        [key: string]: any;
    };
    protected constructor(version: number, plugCode: PluginCode);
    initWebpack(webpackConfig: WebpackConfig): void;
}
