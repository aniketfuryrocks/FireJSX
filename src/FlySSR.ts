import "./GlobalsSetter"
import Page from "./classes/Page";
import StaticArchitect from "./architects/StaticArchitect";
import {FIREJSX_MAP, generateMapJS} from "./Api";
import * as fs from "fs"
import {join, resolve} from "path";

export default class {
    readonly pageMap: Map<string, Page> = new Map()
    readonly renderer: StaticArchitect;

    constructor(pathToLibDir: string) {
        const firejsx_map: FIREJSX_MAP = JSON.parse(fs.readFileSync(`${pathToLibDir}/firejsx.map.json`).toString());
        this.renderer = new StaticArchitect({
            ...firejsx_map.staticConfig,
            outDir: resolve(pathToLibDir),
            fullExternalPath: resolve(join(pathToLibDir, firejsx_map.staticConfig.externals[1]))
        });
        for (const __page in firejsx_map.pageMap) {
            const page = new Page(__page);
            page.chunks = firejsx_map.pageMap[__page];
            this.pageMap.set(__page, page);
        }
    }

    render(page: string, path: string, content: any = {}): [string, string] {
        const _page = this.pageMap.get(page);
        if (!_page)
            throw new Error(`Page ${page} does not exist`)
        return [
            this.renderer.render(_page, path, content),
            generateMapJS(path, content, _page)
        ]
    }
}
