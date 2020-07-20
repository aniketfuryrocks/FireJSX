import "./GlobalsSetter"
import Page from "./classes/Page";
import StaticArchitect from "./architects/StaticArchitect";
import {FIREJSX_MAP} from "./FireJSX";
import * as fs from "fs"
import {JSDOM} from "jsdom";
import {join} from "path";
import {resolve} from "path";

export default class {
    readonly pageMap: Map<string, Page> = new Map()
    readonly renderer: StaticArchitect;

    constructor(pathToLibDir: string) {
        const firejsx_map: FIREJSX_MAP = JSON.parse(fs.readFileSync(`${pathToLibDir}/firejsx.map.json`).toString());
        firejsx_map.staticConfig.outDir = pathToLibDir;
        this.renderer = new StaticArchitect({
            ...firejsx_map.staticConfig,
            fullExternalPath: resolve(join(pathToLibDir, firejsx_map.staticConfig.externals[0]))
        });
        for (const __page in firejsx_map.pageMap) {
            const page = new Page(__page);
            page.chunks = firejsx_map.pageMap[__page];
            this.pageMap.set(__page, page);
        }
    }

    async render(page: string, path: string, content: any = {}): Promise<{
        dom: JSDOM,
        map: string
    }> {
        const _page = this.pageMap.get(page);
        if (!page)
            throw new Error(`Page ${page} does not exist`)
        return {
            dom: await this.renderer.render(_page, path, content),
            map: `FireJSX.map=${JSON.stringify({
                content,
                chunks: _page.chunks
            })}`
        }
    }
}