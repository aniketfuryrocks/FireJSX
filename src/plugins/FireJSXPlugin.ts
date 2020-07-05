import {WebpackConfig} from "../FireJSX";

export enum PluginCode {
    GlobalPlugin = 1,
    PagePlugin
}

export default abstract class FireJSXPlugin {
    public readonly version;
    public readonly plugCode;
    public config: { [key: string]: any };

    protected constructor(version: number, plugCode: PluginCode) {
        this.plugCode = plugCode;
        this.version = version;
    }

    initWebpack(webpackConfig: WebpackConfig) {
    }
}