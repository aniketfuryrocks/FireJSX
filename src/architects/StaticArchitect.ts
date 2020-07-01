import {PathRelatives} from "../FireJSX";
import {join} from "path"
import {ExplicitPages} from "../mappers/ConfigMapper";
import Page from "../classes/Page";
import {JSDOM} from "jsdom"
import GlobalPlugin from "../plugins/GlobalPlugin";
import {requireUncached} from "../utils/Require";
import {Helmet} from "react-helmet"

export interface StaticConfig {
    rel: PathRelatives,
    externals: string[],
    explicitPages: ExplicitPages,
    pathToLib: string,
    template: string | any,
    ssr: boolean,
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
            mapRel: this.config.rel.mapRel
        }
        //init JSDOM
        this.config.template = new JSDOM(param.template)
        //init template
        {
            const script = this.config.template.window.document.createElement("script");
            script.innerHTML =
                `window.FireJSX={` +
                `libRel:"${this.config.rel.libRel}",` +
                `mapRel:"${this.config.rel.mapRel}",` +
                `pages:{404:"/${this.config.explicitPages["404"].substring(0, this.config.explicitPages["404"].lastIndexOf("."))}"}` +
                `${param.ssr ? `,isHydrated:true` : ""}` +
                "}";
            this.config.template.window.document.head.appendChild(script);
        }
        {
            const meta = this.config.template.window.document.createElement("meta");
            meta.content = `FireJSX v${global.__FIREJSX_VERSION__}`;
            meta.name = "generator";
            this.config.template.window.document.head.appendChild(meta);
        }
        //if ssr then load react,react dom,LinkApi,ReactDOMServer chunks
        if (param.ssr)
            require(join(this.config.pathToLib, this.config.externals[0]));
        else //just load LinkApi
            require("../web/LinkApi")
    }

    renderGlobalPlugin(globalPlugin: GlobalPlugin) {
        globalPlugin.initDom(this.config.template);
    }

    render(page: Page, path: string, content: any): Promise<string> {
        return new Promise(resolve => {
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
            global.FireJSX.lazyCount = 0;
            global.FireJSX.lazyDone = 0;
            //chunks
            {
                let index;
                //css
                for (index = 1; index < page.chunks.length; index++) {
                    if (!page.chunks[index].endsWith(".js")) {
                        const cssLink = document.createElement("link");
                        cssLink.href = `/${this.config.rel.libRel}/${page.chunks[index]}`;
                        cssLink.rel = "stylesheet";
                        cssLink.crossOrigin = "anonymous";
                        document.head.prepend(cssLink);
                    } else
                        break;
                }
                //map preload and load
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
                //React
                global.FireJSX.linkApi.preloadChunks([this.config.externals[1]]);
                global.FireJSX.linkApi.loadChunks([this.config.externals[1]]);
                //Main Chunk
                global.FireJSX.linkApi.preloadChunks([page.chunks[0]]);
                global.FireJSX.linkApi.loadChunks([page.chunks[0]]);
                if (this.config.ssr)
                    requireUncached(join(this.config.pathToLib, page.chunks[0]));
                //Render Chunk
                global.FireJSX.linkApi.preloadChunks([this.config.externals[2]]);
                global.FireJSX.linkApi.loadChunks([this.config.externals[2]]);
                //add rest of the chunks
                for (; index < page.chunks.length; index++) {
                    global.FireJSX.linkApi.preloadChunks([page.chunks[index]]);
                    global.FireJSX.linkApi.loadChunks([page.chunks[index]]);
                    if (this.config.ssr)
                        requireUncached(join(this.config.pathToLib, page.chunks[index]));
                }
            }
            global.FireJSX.finishRender = () => {
                page.plugin.onRender(dom);//call plugin
                resolve(dom.serialize());//serialize i.e get html
            }
            //static render
            if (this.config.ssr) {
                document.getElementById("root").innerHTML = global.window.ReactDOMServer.renderToString(
                    global.React.createElement(
                        global.FireJSX.app,
                        {content: global.FireJSX.map.content}
                    )
                );
                const helmet = Helmet.renderStatic();
                for (let helmetKey in helmet)
                    document.head.innerHTML += helmet[helmetKey].toString()
                if (global.FireJSX.lazyCount === 0)
                    global.FireJSX.finishRender();
            } else
                global.FireJSX.finishRender();
        });
    }
}