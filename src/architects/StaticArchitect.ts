import {join} from "path"
import Page from "../classes/Page";
import AppPage from "../classes/AppPage";

export interface Externals {
    full: string
    semi: string
}

export interface StaticConfig {
    lib: string,
    outDir: string,
    externals: Externals,
    ssr: boolean,
    prefix: string,
    staticPrefix: string,
    fullExternalPath: string | undefined,
    appPage: AppPage
}

export default class {
    config: StaticConfig

    constructor(param: StaticConfig) {
        this.config = param;
        FireJSX.lib = this.config.lib;
        FireJSX.isSSR = this.config.ssr;
        FireJSX.staticPrefix = this.config.staticPrefix;
        FireJSX.prefix = this.config.prefix;
        //require full external and app when in ssr
        if (param.ssr)
            require(param.fullExternalPath)
    }

    requireJs(chunk: string) {
        if (chunk.endsWith(".js"))
            require(`${this.config.outDir}/${this.config.lib}/${chunk}`)
    }

    requireAppPage() {
        this.requireJs(this.config.appPage.chunks.runtime);
        this.config.appPage.chunks.initial.forEach(c => this.requireJs(c));
        this.config.appPage.chunks.async.forEach(c => this.requireJs(c))
    }

    render(page: Page, path: string, content: any): string {
        //globals
        location.assign("https://firejsx.com" + path);
        let mapCache;
        if (this.config.ssr) {
            if (!FireJSX.app)
                throw new Error("FireJSX.app not defined. Did you run requireAppPage() on StaticArchitect ?")
            //TODO:Fix here
            /*mapCache = FireJSX.cache[path];
            if (!mapCache)
                mapCache = (FireJSX.cache[path] = {})
            mapCache.content = content;
            mapCache.chunks = page.chunks;
            //if ssr then require async chunks*/
            page.chunks.async.forEach(c => this.requireJs(c));
        }

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
            const arr = this.loadChunks(head, body, [this.config.externals.semi], false)
            head = arr[0]
            body = arr[1]
        }
        //app runtime i.e webpack runtime
        {
            const arr = this.loadChunks(head, body, [this.config.appPage.chunks.runtime], false)
            head = arr[0]
            body = arr[1]
        }
        //app initial
        {
            const arr = this.loadChunks(head, body, this.config.appPage.chunks.initial, false)
            head = arr[0]
            body = arr[1]
        }
        //no need to add entry of page because app has the same entry i,e runtime
        //initial chunks
        {
            const arr = this.loadChunks(head, body, page.chunks.initial)
            head = arr[0]
            body = arr[1]
        }
        //render
        const rootDiv = this.config.ssr ? global.ReactDOMServer.renderToString(
            global.React.createElement(FireJSX.app, {app: mapCache.app, content})
        ) : ""
        //helmet
        if (this.config.ssr) {
            const helmet = global.__FIREJSX_HELMET__.renderStatic();
            for (let helmetKey in helmet)
                head = helmet[helmetKey].toString() + head
        }
        //concat every thing
        return "<!doctype html>" +
            "<html lang=\"en\"><head>" +
            "<meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            `<meta name="generator" content="FireJSX v${FireJSX.version}"/>` +
            `<script>window.FireJSX={pathsCache:{},pagesCache:{},` +
            `isHydrated: ${this.config.ssr},` +
            `lib: "${this.config.lib}",` +
            `prefix: "${this.config.prefix}",` +
            `staticPrefix: "${this.config.staticPrefix}",` +
            `version: "${FireJSX.version}"}</script>` +
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
