"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rmIndexSuffixFromPath = exports.convertPathToUrl = void 0;
/**
 * Removes query and hash from url, then calls rmIndexSuffixFromPath() on it
 * Note: Does not decode the url
 */
function convertPathToUrl(url) {
    return rmIndexSuffixFromPath(url.split(/[?#]/)[0]);
}
exports.convertPathToUrl = convertPathToUrl;
/**
 * Removes /index from path
 */
function rmIndexSuffixFromPath(path) {
    const li = path.lastIndexOf("/index");
    //check if path ends with /index i.e index + 6 chars = length of path
    if (li + 6 != path.length)
        return path;
    return li == -1 ? path : li == 0 ? "/" : path.substring(0, li);
}
exports.rmIndexSuffixFromPath = rmIndexSuffixFromPath;
