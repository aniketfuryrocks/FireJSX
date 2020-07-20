import {resolve} from "path";

export function requireUncached(...paths) {
    const module = resolve(...paths)
    delete require.cache[module];
    return require(module);
}