import GlobalPlugin from "./plugins/GlobalPlugin";
import Page from "./classes/Page";
import StaticArchitect from "./architects/StaticArchitect";
import { PathRelatives } from "./FireJSX";
export default class {
    readonly pageMap: Map<string, Page>;
    readonly renderer: StaticArchitect;
    readonly rel: PathRelatives;
    readonly rootDir: string;
    readonly globalPlugins: GlobalPlugin[];
    constructor(pathToLibDir: string, rootDir?: string);
    loadPlugin(pluginPath: string): void;
    render(page: string, path: string, content?: any): Promise<{
        html: string;
        map: string;
    }>;
}
