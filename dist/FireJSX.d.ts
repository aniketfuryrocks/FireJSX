import GlobalPlugin from "./plugins/GlobalPlugin";
import { Config } from "./mappers/ConfigMapper";
import Cli from "./utils/Cli";
import Page from "./classes/Page";
import { Configuration, Stats } from "webpack";
import PageArchitect from "./architects/PageArchitect";
import StaticArchitect, { StaticConfig } from "./architects/StaticArchitect";
export declare type WebpackConfig = Configuration;
export declare type WebpackStat = Stats;
export interface PathRelatives {
    libRel: string;
    mapRel: string;
}
export interface $ {
    config?: Config;
    pageMap?: Map<string, Page>;
    cli?: Cli;
    rel?: PathRelatives;
    outputFileSystem?: any;
    inputFileSystem?: any;
    renderer?: StaticArchitect;
    pageArchitect?: PageArchitect;
    globalPlugins?: GlobalPlugin[];
}
export interface Params {
    config?: Config;
    outputFileSystem?: any;
    inputFileSystem?: any;
}
export interface FIREJSX_MAP {
    staticConfig: StaticConfig;
    pageMap: {
        [key: string]: string[];
    };
}
export default class {
    private readonly $;
    private constructParams;
    constructor(params?: Params);
    init(): Promise<void>;
    buildPage(page: Page, setCompiler?: (Compiler: any) => void, isExported?: boolean): Promise<any>;
    export(): Promise<unknown>;
    exportFly(): Promise<unknown>;
    getContext(): $;
}
