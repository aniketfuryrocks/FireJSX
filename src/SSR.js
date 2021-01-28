"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Page_1 = require("./classes/Page");
const StaticArchitect_1 = require("./architects/StaticArchitect");
const SSB_1 = require("./SSB");
const path_1 = require("path");
const Globals_1 = require("./Globals");
class default_1 {
    constructor(pathToFlyDir) {
        this.pageMap = new Map();
        Globals_1.initGlobals();
        pathToFlyDir = path_1.resolve(pathToFlyDir);
        const firejsx_map = require(path_1.join(pathToFlyDir, 'firejsx.map.json'));
        this.renderer = new StaticArchitect_1.default(Object.assign(Object.assign({}, firejsx_map.staticConfig), { outDir: pathToFlyDir, fullExternalPath: path_1.join(pathToFlyDir, firejsx_map.staticConfig.externals.full) }));
        if (this.renderer.config.ssr)
            this.renderer.requireAppPage();
        for (const __page in firejsx_map.pageMap) {
            const page = new Page_1.default(__page);
            page.chunks = firejsx_map.pageMap[__page];
            this.pageMap.set(__page, page);
        }
    }
    render(page, path, content = {}) {
        const _page = this.pageMap.get(page);
        if (!_page)
            throw new Error(`Page ${page} does not exist`);
        return [
            this.renderer.render(_page, path, content),
            SSB_1.generateMapJS(path, content, _page)
        ];
    }
    destruct() {
        Globals_1.destructGlobals();
    }
}
exports.default = default_1;
