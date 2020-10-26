import {PageChunks} from "./global";

export default interface FireJSX_CacheMap {
    app?: JSX.Element
    content?: any
    chunks?: PageChunks
}
export default class FireJSX {
    static version?: string
    static lib?: string
    static prefix?: string
    static staticPrefix?: string
    static cache?: {
        [key: string]: FireJSX_CacheMap
    }
    static isSSR?: boolean
    static isHydrated?: boolean
    static linkApi?: {
        lock: boolean,
        loadMap: (url: string) => Promise<FireJSX_CacheMap>
        preloadPage: (url: string) => Promise<void>
        loadPage: (url: string, pushState?: boolean) => Promise<void>
        preloadChunk: (chunk: string, rel: string) => void
        loadChunk: (chunk: string, force: boolean) => Element
    }
    static showLoader?: () => void
    static hideLoader?: () => void
}
