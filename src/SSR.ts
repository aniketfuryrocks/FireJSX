import Page from "./classes/Page";
import StaticArchitect from "./architects/StaticArchitect";
import {FIREJSX_MAP, generateMapJS} from "./SSB";
import {join, resolve} from "path";
import {destructGlobals, initGlobals} from "./Globals";

export default class {
    readonly pageMap: Map<string, Page> = new Map()
    readonly renderer: StaticArchitect;

    constructor(pathToFlyDir: string) {
        initGlobals();
        pathToFlyDir = resolve(pathToFlyDir);
        const firejsx_map: FIREJSX_MAP = require(join(pathToFlyDir, 'firejsx.map.json'));
        this.renderer = new StaticArchitect({
            ...firejsx_map.staticConfig,
            outDir: pathToFlyDir,
            fullExternalPath: join(pathToFlyDir, firejsx_map.staticConfig.externals.full),
        });
        if (this.renderer.config.ssr)
            this.renderer.requireAppPage();
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

    destruct() {
        destructGlobals();
    }
}
