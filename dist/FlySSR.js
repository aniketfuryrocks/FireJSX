"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./GlobalsSetter");
const Page_1 = require("./classes/Page");
const StaticArchitect_1 = require("./architects/StaticArchitect");
const path_1 = require("path");
const PluginMapper_1 = require("./mappers/PluginMapper");
const fs = require("fs");
class default_1 {
    constructor(pathToLibDir, rootDir = process.cwd()) {
        this.pageMap = new Map();
        this.globalPlugins = [];
        const firejs_map = JSON.parse(fs.readFileSync(path_1.join(this.rootDir = rootDir, pathToLibDir, "firejsx.map.json")).toString());
        firejs_map.staticConfig.pathToLib = path_1.join(rootDir, pathToLibDir);
        this.rel = firejs_map.staticConfig.rel;
        this.renderer = new StaticArchitect_1.default(firejs_map.staticConfig);
        for (const __page in firejs_map.pageMap) {
            const page = new Page_1.default(__page);
            page.chunks = firejs_map.pageMap[__page];
            this.pageMap.set(__page, page);
        }
    }
    loadPlugin(pluginPath) {
        const gp = [];
        PluginMapper_1.mapPlugin(pluginPath, { pageMap: this.pageMap, rootPath: this.rootDir, globalPlugins: gp });
        gp.forEach(plug => this.renderer.renderGlobalPlugin(plug));
        this.globalPlugins.push(...gp);
    }
    render(page, path, content = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const _page = this.pageMap.get(page);
            if (!page)
                throw new Error(`Page ${page} does not exist`);
            return {
                html: yield this.renderer.render(_page, path, content),
                map: `FireJSX.map=${JSON.stringify({
                    content,
                    chunks: _page.chunks
                })}`
            };
        });
    }
}
exports.default = default_1;
