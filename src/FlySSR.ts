import "./GlobalsSetter"

import Page from "./classes/Page";
import StaticArchitect from "./architects/StaticArchitect";
import {join} from "path";
import {FIREJSX_MAP} from "./FireJSX";
import * as fs from "fs"
import {JSDOM} from "jsdom";

export default class {
    readonly pageMap: Map<string, Page> = new Map()
    readonly renderer: StaticArchitect;
    readonly rootDir: string;

    constructor(pathToLibDir: string, rootDir: string = process.cwd()) {
        const firejsx_map: FIREJSX_MAP = JSON.parse(fs.readFileSync(join(this.rootDir = rootDir, pathToLibDir, "firejsx.map.json")).toString());
        firejsx_map.staticConfig.pathToLib = join(rootDir, pathToLibDir);
        this.rel = firejsx_map.staticConfig.rel
        this.renderer = new StaticArchitect(firejsx_map.staticConfig);
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