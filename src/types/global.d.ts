declare module NodeJS {
    interface Global {
        window: Global,
        FireJSX: {
            version?: string,
            app?: any,
            lib?: string,
            prefix?: string,
            staticPrefix?: string,
            map?: {
                content: any,
                chunks: PageChunks
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
        },
        webpackJsonp?: any,
        React?: any,
        ReactDOM?: any,
        ReactDOMServer?: any,
    }
}

interface PageChunks {
    initial: string[],//then chunks
    entry: string[],//then runtime
    async: string[],//then async chunks
}