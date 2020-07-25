import {join, resolve} from "path"
import Page from "../classes/Page";
import {JSDOM} from "jsdom"
import {Helmet} from "react-helmet"
import FireJSX from "../FireJSX";

export interface StaticConfig {
    lib: string,
    outDir: string,
    template: string | any,
    externals: string[],
    ssr: boolean,
    prefix: string,
    staticPrefix: string,
    fullExternalPath: string,
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
            require(param.fullExternalPath)
        else //just load LinkApi
            require(resolve(__dirname, "../web/LinkApi"))
    }

    render(page: Page, path: string, content: any): JSDOM {
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
            this.loadChunks([this.config.externals[this.config.ssr ? 1 : 0]], false)
            //async
            if (this.config.ssr)
                page.chunks.async.forEach(chunk => {
                    if (chunk.endsWith(".js"))
                        require(`${this.config.outDir}/${this.config.lib}/${chunk}`)
                })
            //initial
            this.loadChunks(page.chunks.initial)
            //entry
            this.loadChunks(page.chunks.entry)
            //App
            if (!page.app)
                page.app = global.FireJSX.app
        }
        //static render
        if (this.config.ssr) {
            document.getElementById("root").innerHTML = global.window.ReactDOMServer.renderToString(
                global.React.createElement(page.app, {content: global.FireJSX.map.content})
            )
        }
        //head
        if (this.config.ssr) {
            const helmet = Helmet.renderStatic();
            let head = ""
            for (let helmetKey in helmet)
                head += helmet[helmetKey].toString()
            document.head.innerHTML += head
        }
        return dom
    }

    private loadChunks(chunks: string[], _require = true) {
        chunks.forEach(chunk => {
            if (chunk.endsWith(".css")) {
                const link = document.createElement("link");
                link.href = `${this.config.prefix}/${this.config.lib}/${chunk}`
                link.rel = "stylesheet";
                link.crossOrigin = "anonymous";
                document.head.insertBefore(link, document.head.firstChild);
            } else {
                if (this.config.ssr && _require && chunk.endsWith(".js"))//only require javascript
                    require(join(this.config.outDir, this.config.lib, chunk))
                global.FireJSX.linkApi.preloadChunks([chunk]);
                global.FireJSX.linkApi.loadChunks([chunk]);
            }
        })
    }
}