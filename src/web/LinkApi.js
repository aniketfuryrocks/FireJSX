//listens to next and prev page i.e navigation events
window.onpopstate = function () {
    const path = location.pathname.replace(FireJSX.prefix, "");//remove prefix
    FireJSX.linkApi.loadPage(path, false)
}

//gets path from url by excluding ? and #
function getPathFromUrl(url) {
    return url.split(/[?#]/)[0];
}

FireJSX.linkApi = {
    chunkCache: {},
    lock: false,
    loadMap: function (url) {
        return new Promise((resolve, reject) => {
            const map = FireJSX.map[url];
            if (map)//if already loaded then resolve
                resolve(map)
            else {
                const chunk_path = `map${url === "/" ? "/index" : url}.map.js`;
                const ele = this.loadChunk(chunk_path);
                ele.onload = () => resolve(FireJSX.map[url]);
                ele.onerror = () => {
                    //delete it because onError happens once
                    delete this.chunkCache[`map${url === "/" ? "/index" : url}.map.js`];
                    if (url === "/404")
                        reject(new Error("Error loading 404 map"))
                    this.loadMap("/404").then(() => resolve(FireJSX.map["/404"])).catch(reject);
                }
            }
        })
    },
    preloadPage: async function (url) {
        const map = await this.loadMap(getPathFromUrl(url));
        map.chunks.entry.forEach(c => this.preloadChunk(c, "prefetch"));
        map.chunks.initial.forEach(c => this.preloadChunk(c, "prefetch"));
    },
    loadPage: async function (url, pushState = true) {
        if (this.lock)
            return;
        this.lock = true
        //webpack5 -> window.webpackChunktest = undefined
        window.webpackJsonp = undefined;
        //push state
        if (pushState)
            window.history.pushState(undefined, undefined, FireJSX.prefix + url);
        url = getPathFromUrl(url);//url
        //map
        const map = await this.loadMap(url);
        //force loading to run them
        map.chunks.entry.forEach(c => this.loadChunk(c, true));
        map.chunks.initial.forEach(c => this.loadChunk(c, true));
    },
    preloadChunk: function (chunk, rel) {
        let ele = this.chunkCache[chunk];
        if (ele)//check has already been loaded
            return ele;
        this.chunkCache[chunk] = ele = document.createElement("link");
        ele.rel = rel;
        ele.href = `${FireJSX.prefix}/${FireJSX.lib}/${chunk}`;
        ele.crossOrigin = "anonymous";
        if (chunk.endsWith(".js"))
            ele.setAttribute("as", "script");
        else if (chunk.endsWith(".css"))
            ele.setAttribute("as", "style");
        document.head.appendChild(ele);
    },
    //force: force rerun of chunk
    loadChunk: function (chunk, force) {
        let ele = this.chunkCache[chunk];
        if (ele) { //check has already been loaded
            if (force)
                ele.remove()
            else
                return ele;
        }
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
        return this.chunkCache[chunk] = ele;
    }
}
