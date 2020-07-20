import {join} from "path"
import Page from "../classes/Page";
import {JSDOM} from "jsdom"
import {requireUncached} from "../utils/Require";
import {Helmet} from "react-helmet"

export interface StaticConfig {
    lib: string,
    outDir: string,
    template: string | any,
    externals: string[],
    ssr: boolean,
    prefix: string,
    staticPrefix: string,
    fullExternalPath: string
}

export interface StaticData extends StaticConfig {
    template: JSDOM
}

export default class {
    config: StaticData

    constructor(param: StaticConfig) {
        this.config = param;
        //global.window circular
        // @ts-ignore
        global.window = global;
        global.FireJSX = {
            lib: param.lib,
            isSSR: param.ssr,
            staticPrefix: this.config.staticPrefix,
            prefix: this.config.prefix
        }
        //init JSDOM
        this.config.template = new JSDOM(param.template)
        //init template
        {
            const script = this.config.template.window.document.createElement("script");
            script.id = "__FireJSX_INIT__"
            script.innerHTML = `window.FireJSX =` + JSON.stringify({
                isHydrated: param.ssr,
                lib: param.lib,
                prefix: param.prefix,
                staticPrefix: param.staticPrefix
            })
            this.config.template.window.document.head.appendChild(script);
        }
        {
            const meta = this.config.template.window.document.createElement("meta");
            meta.content = `FireJSX v${global.__FIREJSX_VERSION__}`;
            meta.name = "generator";
            this.config.template.window.document.head.appendChild(meta);
        }
        //require uncached to prevent bugs in lambda because node clears these 2 when a new request is assigned
        //if ssr then load react,react dom,LinkApi,ReactDOMServer chunks
        if (param.ssr)
            requireUncached(param.fullExternalPath)
        else //just load LinkApi
            requireUncached("../web/LinkApi")
    }

    render(page: Page, path: string, content: any): Promise<JSDOM> {
        return new Promise(resolve => {
            //webpack global variable reset
            global.window.webpackJsonp = undefined
            //template serialize to prevent overwriting
            const dom = new JSDOM(this.config.template.serialize(), {
                url: "http://localhost:5000" + this.config.prefix + path,
            });
            //load stuff from dom.window to global
            for (const domKey of ["document", "location", "history", "navigator", "screen", "matchMedia", "getComputedStyle"])
                global[domKey] = dom.window[domKey];
            //globals
            global.FireJSX.map = {
                content,
                chunks: page.chunks
            };
            //isSSR
            global.FireJSX.isSSR = this.config.ssr
            //reset lazy count
            global.FireJSX.lazyPromises = <Promise<any>[]>[];
            //chunks
            {
                //preload and load page map
                {
                    const link = document.createElement("link");
                    const script = document.createElement("script");
                    script.src = link.href = global.FireJSX.linkApi.getMapUrl(path);
                    link.rel = "preload";
                    script.crossOrigin = link.crossOrigin = "anonymous";
                    link.setAttribute("as", "script");
                    document.head.appendChild(link);
                    document.body.appendChild(script);
                }
                //external group semi
                this.loadChunks([this.config.externals[1]], false)
                //entry
                this.loadChunks(page.chunks.entry)
                //initial
                this.loadChunks(page.chunks.initial)
            }
            //require
            if (this.config.ssr)
                page.chunks.async.forEach(chunk => requireUncached(join(`${this.config.outDir}/${this.config.lib}`, chunk)))
            //static render
            if (this.config.ssr) {
                document.getElementById("root").innerHTML = global.window.ReactDOMServer.renderToString(
                    global.React.createElement(
                        global.__FIREJSX_APP__,
                        {content: global.FireJSX.map.content}
                    )
                )
            }
            //resolve all promises
            (async () => {
                for await (const lazyPromise of global.FireJSX.lazyPromises) {
                    await lazyPromise()
                }
                if (this.config.ssr) {
                    const helmet = Helmet.renderStatic();
                    for (let helmetKey in helmet)
                        document.head.innerHTML += helmet[helmetKey].toString()
                }
                resolve(dom);//resolve DOM
            })()
        });
    }

    private loadChunks(chunks: string[], _require = true) {
        chunks.forEach(chunk => {
            if (chunk.endsWith(".css")) {
                const link = document.createElement("link");
                link.href = `${this.config.lib}/${chunk}`
                link.rel = "stylesheet";
                link.crossOrigin = "anonymous";
                document.head.insertBefore(link, document.head.firstChild);
            } else {
                if (this.config.ssr && _require && chunk.endsWith(".js"))//only require javascript
                    requireUncached(join(`${this.config.outDir}/${this.config.lib}`, chunk))
                global.FireJSX.linkApi.preloadChunks([chunk]);
                global.FireJSX.linkApi.loadChunks([chunk]);
            }
        })
    }
}