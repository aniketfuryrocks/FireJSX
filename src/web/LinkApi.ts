import {pathsCacheElement} from "../types/global";
import {convertPathToUrl} from "../utils/LinkTools";

if (!FireJSX.isSSR)
    window.onpopstate = function () {
        const path = location.pathname.replace(FireJSX.prefix, "");//remove prefix
        FireJSX.linkApi.loadPage(path, false)
    }

FireJSX.linkApi = {
    lock: false,
    chunksStatusMap: (() => {
        if (FireJSX.isSSR)
            return;
        const chunksStatusMap = {};
        let possiblePathsCache = FireJSX.pathsCache[convertPathToUrl(decodeURI(location.pathname))];
        //if path exists then use it's respective page, else use 404
        const pageCache = possiblePathsCache ? FireJSX.pagesCache[possiblePathsCache.page] : FireJSX.pagesCache["404.jsx"];
        //mark the chunks as loaded
        pageCache.chunks.initial.forEach(c => chunksStatusMap[c] = true);
        return chunksStatusMap;
    })(),
    loadMap(url) {
        return new Promise((resolve, reject) => {
            const chunk_path = `map${url === "/" ? "/index" : url}.map.js`;
            const ele = this.loadChunk(chunk_path);
            ele.onload = () => resolve(FireJSX.pathsCache[url]);
            ele.onerror = () => {
                if (url === "/404")
                    throw new Error("Error loading 404 map. Make sure 404 page exists.");
                //if 404 is cached then return it right away
                const mapCache404 = FireJSX.pathsCache["/404"];
                if (mapCache404)
                    return resolve(FireJSX.pathsCache[url] = mapCache404);
                //else load 404 map
                this.loadMap("/404")
                    .then(() => resolve(FireJSX.pathsCache[url] = FireJSX.pathsCache["/404"]))
                    .catch(reject);
            };
        })
    },
    async preloadPage(url) {
        url = convertPathToUrl(url);
        if (FireJSX.pathsCache[url])
            return;
        const {page}: pathsCacheElement = await this.loadMap(url);
        FireJSX.pagesCache[page].chunks.initial.forEach(c => this.preloadChunk(c, "prefetch"));
    },
    async loadPage(url, pushState = true) {
        if (this.lock)
            return;
        //check if user wants to pause navigation
        if (window.onbeforeunload)
            if (!window.onbeforeunload(new Event('beforeunload')))
                return;
        if (pushState)
            window.history.pushState(undefined, undefined, FireJSX.prefix + url);
        //show loader
        if (FireJSX.showLoader)
            FireJSX.showLoader();
        //set lock
        this.lock = true;
        url = convertPathToUrl(url);//url
        //map
        let pathsCacheElement = FireJSX.pathsCache[url];
        if (!pathsCacheElement)
            pathsCacheElement = await this.loadMap(url);
        const pageCacheElement = FireJSX.pagesCache[pathsCacheElement.page]
        if (!pageCacheElement.app)
            pageCacheElement.chunks.initial.forEach((c) => this.loadChunk(c));
        else
            FireJSX.run(pageCacheElement.app)
    },
    preloadChunk(chunk, rel) {
        //false when preloaded, undefined if neither loaded nor preloaded
        if (this.chunksStatusMap[chunk] === undefined) {
            const ele = document.createElement("link");
            ele.rel = rel;
            ele.href = `${FireJSX.prefix}/${FireJSX.lib}/${chunk}`;
            ele.crossOrigin = "anonymous";
            if (chunk.endsWith(".js"))
                ele.setAttribute("as", "script");
            else if (chunk.endsWith(".css"))
                ele.setAttribute("as", "style");
            document.head.appendChild(ele);
            this.chunksStatusMap[chunk] = false;
        }
    },
    loadChunk(chunk) {
        //if true, then already loaded
        if (this.chunksStatusMap[chunk])
            return;
        let ele;
        if (chunk.endsWith(".js")) {
            ele = document.createElement("script");
            ele.src = `${FireJSX.prefix}/${FireJSX.lib}/${chunk}`
        } else {
            ele = document.createElement("link");
            ele.href = `${FireJSX.prefix}/${FireJSX.lib}/${chunk}`
            if (chunk.endsWith(".css"))
                ele.rel = "stylesheet";
        }
        ele.crossOrigin = "anonymous";
        document.body.appendChild(ele);
        this.chunksStatusMap[chunk] = true;
        return ele;
    }
}
