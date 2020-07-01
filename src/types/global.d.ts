declare module NodeJS {
    interface Global {
        window: Global,
        FireJSX: {
            app?: any,
            libRel?: string,
            mapRel?: string,
            map?: {
                content: any,
                chunks: string[]
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
            finishRender?: () => void,
            lazyCount?: number,
            lazyDone?: number,
            pages?: {
                404: string
            },
            showLoader?: () => void
        },
        React?: any,
        ReactDOM?: any,
        ReactDOMServer?: any,
        __FIREJSX_VERSION__: string;
    }
}
