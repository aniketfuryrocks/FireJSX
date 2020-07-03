"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMap = void 0;
const Page_1 = require("../classes/Page");
const Fs_1 = require("../utils/Fs");
function createMap(path_to_pages, inputFileSystem) {
    const map = new Map();
    Fs_1.readDirRecursively(path_to_pages, inputFileSystem, (page) => {
        const rel_page = page.replace(path_to_pages + "/", "");
        map.set(rel_page, new Page_1.default(rel_page));
    });
    return map;
}
exports.createMap = createMap;
