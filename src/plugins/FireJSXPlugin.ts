import {WebpackConfig} from "../FireJSX";
import {Config} from "../mappers/ConfigMapper";

export enum PluginCode {
    GlobalPlugin = 1,
    PagePlugin
}

export default abstract class FireJSXPlugin {
    public readonly version;
    public readonly plugCode;
    public config: Config;

    protected constructor(version: number, plugCode: PluginCode) {
        this.plugCode = plugCode;
        this.version = version;
    }

    initWebpack(webpackConfig: WebpackConfig) {
    }
}