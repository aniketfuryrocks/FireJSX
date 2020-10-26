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
    lock: false,
    loadMap(url) {
        return new Promise((resolve, reject) => {
            const chunk_path = `map${url === "/" ? "/index" : url}.map.js`;
            const ele = this.loadChunk(chunk_path);
            ele.onload = () => resolve(FireJSX.cache[url]);
            ele.onerror = () => {
                //delete it because onError happens once
                if (url === "/404")
                    reject(new Error("Error loading 404 map. Make sure 404 page exists."))
                //load 404
                this.loadMap("/404")
                    .then(() => resolve(FireJSX.cache[url] = FireJSX.cache["/404"]))
                    .catch(reject);
            }
        })
    },
    async preloadPage(url) {
        if (FireJSX.cache[url])
            return;
        const {chunks} = await this.loadMap(getPathFromUrl(url));
        chunks.entry.forEach(c => this.preloadChunk(c, "prefetch"));
        chunks.initial.forEach(c => this.preloadChunk(c, "prefetch"));
    },
    async loadPage(url, pushState = true) {
        if (this.lock)
            return;
        this.lock = true;
        //push state
        if (pushState)
            window.history.pushState(undefined, undefined, FireJSX.prefix + url);
        url = getPathFromUrl(url);//url
        //map
        let cacheMap = FireJSX.cache[url];
        if (!cacheMap)
            cacheMap = await this.loadMap(url);
        if (!cacheMap.app) {
            cacheMap.chunks.entry.forEach(this.loadChunk);
            cacheMap.chunks.initial.forEach(this.loadChunk);
        } else
            FireJSX.run(url)
    },
    preloadChunk(chunk, rel) {
        const ele = document.createElement("link");
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
    loadChunk(chunk) {
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
        return ele;
    }
}
