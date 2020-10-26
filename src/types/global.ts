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
