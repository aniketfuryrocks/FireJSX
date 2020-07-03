import WebpackArchitect from "./WebpackArchitect";
import { $, WebpackConfig, WebpackStat } from "../FireJSX";
import Page from "../classes/Page";
import { Compiler } from "webpack";
export default class {
    private readonly $;
    readonly webpackArchitect: WebpackArchitect;
    isOutputCustom: boolean;
    isInputCustom: boolean;
    constructor(globalData: $, webpackArchitect: any, isOutputCustom: boolean, isInputCustom: boolean);
    buildExternals(): Promise<string[]>;
    buildPage(page: Page, resolve: () => void, reject: (err: any | undefined) => void): Compiler;
    build(config: WebpackConfig, resolve: (stat: any) => void, reject: (err: any) => void): Compiler;
    logStat(stat: WebpackStat): boolean;
}
