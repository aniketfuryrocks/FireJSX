declare module NodeJS {
    interface Global {
        window: Global,
        FireJSX: {
            app?: any,
            libRel?: string,
            mapRel?: string,
            prefix?: string,
            staticPrefix?: string,
            addStaticPrefix?: (url: string) => string,
            map?: {
                content: any,
                chunks: PageChunks
            },
            isSSR?: boolean,
            isHydrated?: boolean,
            linkApi?: {
                getMapUrl: (url: string) => string,
                loadMap: (url: string) => Element,
                preloadPage: (url: string, callback: () => void) => void,
                loadPage: (url: string, pushState?: boolean) => void,
                runApp: (el?: any) => void,
                preloadChunks: (chunks: string[]) => void,
                loadChunks: (chunks: string[]) => void
            },
            pages?: {
                404: string
            },
            lazyPromises?: Promise<any>[],
            showLoader?: () => void,
        },
        __FIREJSX_APP__:any,//for ssr
        webpackJsonp?: any,
        React?: any,
        ReactDOM?: any,
        ReactDOMServer?: any,
        __FIREJSX_VERSION__: string;
    }
}

interface PageChunks {
    initial: string[],//then chunks
    entry: string[],//then runtime
    async: string[],//then async chunks
}