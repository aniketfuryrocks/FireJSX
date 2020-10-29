import {FunctionComponent} from "react";

export default interface FireJSX_CacheMap {
    app?: FunctionComponent
    content?: any
    chunks?: PageChunks
}

declare global {
    namespace NodeJS {
        interface Global extends FireJSX_GLOBAL {
            window: Window,
            buildPageResolver: () => void | undefined
            FireJSX
        }
    }

    interface Window extends FireJSX_GLOBAL {
        buildPageResolver: () => void | undefined
        FireJSX
    }

    namespace FireJSX {
        let app: FunctionComponent<{
            app: FunctionComponent,
            content: any
        }>
        let setApp: (App: FunctionComponent, Content: any) => void
        let run: (path: string) => void
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
            loadPage: (url: string, pushState?: boolean) => Promise<void>
            preloadChunk: (chunk: string, rel: string) => void
            loadChunk: (chunk: string) => Element
        }
        let showLoader: () => void
        let hideLoader: () => void
    }

    namespace React {

    }
}

export interface FireJSX_GLOBAL {
    FireJSX_jsonp: any[]

    __webpack_require__(resolveID1: any)

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

export interface appPageChunks extends PageChunks {
    runtime: string
}

export interface PageChunks {
    initial: string[]
    async: string[]
}
