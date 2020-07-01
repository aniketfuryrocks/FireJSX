import Page from "../classes/Page";
import {readDirRecursively} from "../utils/Fs";

export function createMap(path_to_pages: string, inputFileSystem): Map<string, Page> {
    const map = new Map();
    readDirRecursively(path_to_pages, inputFileSystem, (page) => {
        const rel_page = page.replace(path_to_pages + "/", "")
        map.set(rel_page, new Page(rel_page));
    })
    return map;
}