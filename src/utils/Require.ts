import {resolve} from "path";

export function requireUncached(module) {
    module = resolve(module)
    delete require.cache[module];
    return require(module);
}