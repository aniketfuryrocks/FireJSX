import {window as ssr_window} from "ssr-window";

export const FireJSX_Version = "0.10.0-rc.9";

export function initGlobals() {

    //check if already initialized
    {
        for (const prop of ["FireJSX", "FireJSX_jsonp"])
            if (global[prop])
                throw new Error(`FireJSX is already initialized. Call release function from the class object or else make sure global.${prop} is undefined.`);
    }
    //initialize if not

    global.FireJSX = {
        version: FireJSX_Version,
        pagesCache: {},
        pathsCache: {}
    }
    // @ts-ignore
    global.self = global;

    for (const prop in ["document", "navigator", "history"])
        global[prop] = ssr_window[prop]

    global.location = {
        ancestorOrigins: undefined,
        assign(url: string): void {
            const parsed_url = new URL(url);
            this.hash = parsed_url.hash;
            this.host = parsed_url.host;
            this.hostname = parsed_url.hostname;
            this.href = parsed_url.href;
            this.origin = parsed_url.origin;
            this.pathname = parsed_url.pathname;
            this.port = parsed_url.port;
            this.protocol = parsed_url.protocol;
            this.search = parsed_url.search;
        },
        hash: "",
        host: "",
        hostname: "",
        href: "",
        origin: "",
        pathname: "",
        port: "",
        protocol: "",
        replace(url: string): void {
            this.assign(url)
        },
        search: "",
        toString(): string {
            return "";
        },
        reload(forcedReload?: boolean): void {
        }
    }
    location.assign("https://firejsx.com")
}

export function destructGlobals() {
    global.FireJSX = undefined;
    global.FireJSX_jsonp = undefined;
}
