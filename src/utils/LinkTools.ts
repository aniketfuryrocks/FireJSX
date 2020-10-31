/**
 * Removes query and hash from url, then calls rmIndexSuffixFromPath() on it
 * Note: Does not decode the url
 */
export function convertPathToUrl(url: string) {
    return rmIndexSuffixFromPath(url.split(/[?#]/)[0]);
}

/**
 * Removes /index from path
 */
export function rmIndexSuffixFromPath(path: string) {
    const li = path.lastIndexOf("/index");
    //check if path ends with /index i.e index + 6 chars = length of path
    if (li + 6 != path.length)
        return path;
    return li == -1 ? path : li == 0 ? "/" : path.substring(0, li);
}
