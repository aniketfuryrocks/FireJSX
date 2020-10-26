export default interface FireJSX_CacheMap {
    app?: JSX.Element
    content?: any
    chunks?: PageChunks
}

declare global {
    namespace NodeJS {
        interface Global extends FireJSX_GLOBAL {
            window: Window,
            FireJSX
        }
    }

    interface Window extends FireJSX_GLOBAL {
        FireJSX
    }

    namespace FireJSX {
        let version: string
        let lib: string
        let prefix: string
        let staticPrefix: string
        let cache: {
            [key: string]: FireJSX_CacheMap
        }
        let isSSR: boolean
        let isHydrated: boolean
        let linkApi: {
            lock: boolean,
            loadMap: (url: string) => Promise<FireJSX_CacheMap>
            preloadPage: (url: string) => Promise<void>
            loadPage: (url: string, pushState: boolean) => Promise<void>
            preloadChunk: (chunk: string, rel: string) => void
            loadChunk: (chunk: string, force: boolean) => Element
        }
        let showLoader: () => void
        let hideLoader: () => void
    }
}

export interface FireJSX_GLOBAL {
    //webpack5 -> webpackChunktest?: any,
    __webpack_require__(resolveID1: any),

    webpackJsonp?: any,
    React?: any,
    ReactDOM?: any,
    ReactDOMServer?: any,
    __FIREJSX_HELMET__: {
        renderStatic: () => {
            [Key: string]: {
                toString: () => string
            }
        },
        canUseDOM: boolean
    }
}

export interface PageChunks {
    initial: string[],//then chunks
    entry: string[],//then runtime
    async: string[],//then async chunks
}
