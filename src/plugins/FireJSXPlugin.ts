import {WebpackConfig} from "../FireJSX";
import {Config} from "../mappers/ConfigMapper";
import {Args} from "../mappers/ArgsMapper";

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

    async init(args: Args) {

    }

    initWebpack(webpackConfig: WebpackConfig) {
    }
}