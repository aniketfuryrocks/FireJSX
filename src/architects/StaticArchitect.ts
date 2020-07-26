import {join} from "path"
import Page from "../classes/Page";
import {Helmet} from "react-helmet"

export interface StaticConfig {
    lib: string,
    outDir: string,
    externals: string[],
    ssr: boolean,
    prefix: string,
    staticPrefix: string,
    fullExternalPath: string,
}

import {JSDOM} from "jsdom"

{
    // @ts-ignore
    global.window = global
    const dom = new JSDOM()
    for (const domKey of ["document", "location", "history", "navigator", "screen", "matchMedia", "getComputedStyle"])
        global[domKey] = dom.window[domKey];
}

export default class {
    config: StaticConfig

    constructor(param: StaticConfig) {
        this.config = param;
        if (param.ssr)
            require(param.fullExternalPath)
    }

    render(page: Page, path: string, content: any): string {
        //globals
        global.FireJSX.lib = this.config.lib
        global.FireJSX.isSSR = this.config.ssr
        global.FireJSX.staticPrefix = this.config.staticPrefix
        global.FireJSX.prefix = this.config.prefix
        global.FireJSX.map = {
            content,
            chunks: page.chunks
        };
        //if ssr then require async chunks
        if (this.config.ssr)
            page.chunks.async.forEach(chunk => {
                if (chunk.endsWith(".js"))
                    require(`${this.config.outDir}/${this.config.lib}/${chunk}`)
            })
        let head, body;
        //map
        {
            const li = path.lastIndexOf("/index")
            const mapPath = `${this.config.prefix}/${this.config.lib}/map${li <= 0 ? path : path.substring(0, li)}.map.js`
            head = `<link href="${mapPath}" as="script" rel="preload" crossorigin="anonymous"/>`
            body = `<script src="${mapPath}" crossorigin="anonymous"></script>`
        }
        //external mini
        {
            const arr = this.loadChunks(head, body, [this.config.externals[this.config.ssr ? 1 : 0]], false)
            head = arr[0]
            body = arr[1]
        }
        //entry chunks
        {
            const arr = this.loadChunks(head, body, page.chunks.entry)
            head = arr[0]
            body = arr[1]
        }
        //initial chunks
        {
            const arr = this.loadChunks(head, body, page.chunks.initial)
            head = arr[0]
            body = arr[1]
        }
        if (!page.app)
            page.app = global.FireJSX.app
        //render
        const rootDiv = this.config.ssr ? global.window.ReactDOMServer.renderToString(
            global.React.createElement(page.app, {content: global.FireJSX.map.content})
        ) : ""
        //helmet
        if (this.config.ssr) {
            const helmet = Helmet.renderStatic();
            for (let helmetKey in helmet)
                head += helmet[helmetKey].toString()
        }
        //concat every thing
        return "<!doctype html>" +
            "<html lang=\"en\"><head>" +
            "<meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width,user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1\">" +
            "<meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">" +
            `<meta name="generator" content="FireJSX v${global.FireJSX.version}"/>` +
            `<script>window.FireJSX={
                    isHydrated: "${this.config.ssr}",
                    lib: "${this.config.lib}",
                    prefix: "${this.config.prefix}",
                    staticPrefix: "${this.config.staticPrefix}",
                    version: "${global.FireJSX.version}"
                }</script>` +
            head +
            "</head><body><div id=\"root\">" +
            rootDiv +
            "</div>" +
            body +
            "</body></html>"
    }

    private loadChunks(head: string, body: string, chunks: string[], _require = true): [string, string] {
        chunks.forEach(chunk => {
            const src = `${this.config.prefix}/${this.config.lib}/${chunk}`
            if (chunk.endsWith(".js")) {
                if (this.config.ssr && _require)
                    require(join(this.config.outDir, this.config.lib, chunk))
                head += `<link rel="preload" href="${src}" as="script" crossorigin="anonymous"/>`
                body += `<script src="${src}" crossorigin="anonymous"></script>`
            } else if (chunk.endsWith(".css"))
                head = `<link rel="stylesheet" href="${src}" crossorigin="anonymous"/>` + head
            else
                body += `<link href="${src}" crossorigin="anonymous"/>`
        })
        return [head, body]
    }
}