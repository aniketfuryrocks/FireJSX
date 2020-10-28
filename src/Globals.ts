import {window as ssr_window} from "ssr-window";

export const FireJSX_Version = "0.10.0-beta.6";

export function initGlobals() {
    if (global.FireJSX)
        throw new Error("FireJSX is already initialized. Call release function from the class object or if not so, then make sure global.FireJSX is undefined.")

    global.FireJSX = {
        version: FireJSX_Version,
        cache: {},
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
}
