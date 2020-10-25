declare global {
    namespace NodeJS {
        interface Global extends FireJSX_GLOBAL {
            window: Global
        }
    }

    interface Window extends FireJSX_GLOBAL {
        noo: any
    }
}

export interface FireJSX_GLOBAL {
    FireJSX: {
        version?: string,
        lib?: string,
        prefix?: string,
        staticPrefix?: string,
        cache?: {
            [key: string]: {
                app?: React.Component
                map?: {
                    content: any,
                    chunks: PageChunks
                }
            }
        },
        isSSR?: boolean,
        isHydrated?: boolean,
        linkApi?: {
            lock: boolean
            getMapUrl: (url: string) => string,
            loadMap: (url: string) => Element,
            preloadPage: (url: string, callback: () => void) => void,
            loadPage: (url: string, pushState?: boolean) => void,
            preloadChunks: (chunks: string[]) => void,
            loadChunks: (chunks: string[]) => void
        },
        showLoader?: () => void,
        hideLoader?: () => void
    },
    //webpack5 -> webpackChunktest?: any,
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
