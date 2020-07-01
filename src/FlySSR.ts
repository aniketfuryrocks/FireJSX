require("./GlobalsSetter")

import GlobalPlugin from "./plugins/GlobalPlugin";
import Page from "./classes/Page";
import StaticArchitect from "./architects/StaticArchitect";
import {join} from "path";
import {mapPlugin} from "./mappers/PluginMapper";
import {FIREJSX_MAP, PathRelatives} from "./FireJSX";
import * as fs from "fs"

export default class {
    readonly pageMap: Map<string, Page> = new Map()
    readonly renderer: StaticArchitect;
    readonly rel: PathRelatives;
    readonly rootDir: string;
    readonly globalPlugins: GlobalPlugin[] = [];

    constructor(pathToLibDir: string, rootDir: string = process.cwd()) {
        const firejs_map: FIREJSX_MAP = JSON.parse(fs.readFileSync(join(this.rootDir = rootDir, pathToLibDir, "firejsx.map.json")).toString());
        firejs_map.staticConfig.pathToLib = join(rootDir, pathToLibDir);
        this.rel = firejs_map.staticConfig.rel
        this.renderer = new StaticArchitect(firejs_map.staticConfig);
        for (const __page in firejs_map.pageMap) {
            const page = new Page(__page);
            page.chunks = firejs_map.pageMap[__page];
            this.pageMap.set(__page, page);
        }
    }

    loadPlugin(pluginPath: string) {
        const gp: GlobalPlugin[] = [];
        mapPlugin(pluginPath, {pageMap: this.pageMap, rootPath: this.rootDir, globalPlugins: gp});
        gp.forEach(plug => this.renderer.renderGlobalPlugin(plug))
        this.globalPlugins.push(...gp);
    }

    async render(page: string, path: string, content: any = {}): Promise<{
        html: string,
        map: string
    }> {
        const _page = this.pageMap.get(page);
        return {
            html: await this.renderer.render(_page, path, content),
            map: `FireJSX.map=${JSON.stringify({
                content,
                chunks: _page.chunks
            })}`
        }
    }
}