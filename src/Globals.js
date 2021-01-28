"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destructGlobals = exports.initGlobals = exports.FireJSX_Version = void 0;
const ssr_window_1 = require("ssr-window");
exports.FireJSX_Version = "0.10.2";
function initGlobals() {
    //check if already initialized
    {
        for (const prop of ["FireJSX", "FireJSX_jsonp"])
            if (global[prop])
                throw new Error(`FireJSX is already initialized. Call release function from the class object or else make sure global.${prop} is undefined.`);
    }
    //initialize if not
    global.FireJSX = {
        version: exports.FireJSX_Version,
        pagesCache: {},
        pathsCache: {}
    };
    // @ts-ignore
    global.self = global;
    for (const prop in ["document", "navigator", "history"])
        global[prop] = ssr_window_1.window[prop];
    global.location = {
        ancestorOrigins: undefined,
        assign(url) {
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
        replace(url) {
            this.assign(url);
        },
        search: "",
        toString() {
            return "";
        },
        reload(forcedReload) {
        }
    };
    location.assign("https://firejsx.com");
}
exports.initGlobals = initGlobals;
function destructGlobals() {
    global.FireJSX = undefined;
    global.FireJSX_jsonp = undefined;
}
exports.destructGlobals = destructGlobals;
