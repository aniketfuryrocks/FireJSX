import {PathRelatives} from "../FireJSX";
import {join} from "path"
import {ExplicitPages} from "../mappers/ConfigMapper";
import Page from "../classes/Page";
import {JSDOM} from "jsdom"
import {requireUncached} from "../utils/Require";
import {Helmet} from "react-helmet"

export interface StaticConfig {
    rel: PathRelatives,
    explicitPages: ExplicitPages,
    pathToLib: string,
    template: string | any,
    externals: string[],
    ssr: boolean,
    prefix: string,
    staticPrefix: string
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
            isSSR: param.ssr,
            libRel: this.config.rel.libRel,
            mapRel: this.config.rel.mapRel,
            staticPrefix: this.config.staticPrefix
        }
        //init JSDOM
        this.config.template = new JSDOM(param.template)
        //init template
        {
            const script = this.config.template.window.document.createElement("script");
            script.id = "__FireJSX_INIT__"
            script.innerHTML =
                `window.FireJSX={` +
                `libRel:"${this.config.rel.libRel}",` +
                `mapRel:"${this.config.rel.mapRel}",` +
                `pages:{404:"/${this.config.explicitPages["404"].substring(0, this.config.explicitPages["404"].lastIndexOf("."))}"}` +
                `${param.ssr ? `,isHydrated:true` : ""},` +
                `prefix:"${this.config.prefix}",` +
                `staticPrefix:"${this.config.staticPrefix}"` +
                "}";
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
            requireUncached(join(this.config.pathToLib, this.config.externals[0]));
        else //just load LinkApi
            requireUncached("../web/LinkApi")
    }

    render(page: Page, path: string, content: any): Promise<JSDOM> {
        return new Promise(resolve => {
            //webpack global variable reset
            global.window.webpackJsonp = undefined
            //template serialize to prevent overwriting
            const dom = new JSDOM(this.config.template.serialize(), {
                url: "https://localhost:5000" + path,
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
                global.FireJSX.linkApi.preloadChunks([this.config.externals[1]]);
                global.FireJSX.linkApi.loadChunks([this.config.externals[1]]);
                //initial
                global.FireJSX.linkApi.preloadChunks(page.chunks.initial);
                global.FireJSX.linkApi.loadChunks(page.chunks.initial);
                //oad entry
                global.FireJSX.linkApi.preloadChunks(page.chunks.entry);
                global.FireJSX.linkApi.loadChunks(page.chunks.entry);
            }
            /*//require
            if (this.config.ssr) {
                requireUncached(join(this.config.pathToLib, page.chunks.main));
                page.chunks.lazy.forEach(chunk => requireUncached(join(this.config.pathToLib, chunk)))
            }*/
            //static render
            if (this.config.ssr) {
                document.getElementById("root").innerHTML = global.window.ReactDOMServer.renderToString(
                    global.React.createElement(
                        global.FireJSX.app,
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
}