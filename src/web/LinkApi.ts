//listens to next and prev page i.e navigation events

if (!FireJSX.isSSR)
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
    chunksStatusMap: {},
    loadMap(url) {
        return new Promise((resolve, reject) => {
            const chunk_path = `map${url === "/" ? "/index" : url}.map.js`;
            const ele = this.loadChunk(chunk_path);
            ele.onload = () => resolve(FireJSX.cache[url]);
            ele.onerror = () => {
                if (url === "/404")
                    throw new Error("Error loading 404 map. Make sure 404 page exists.");
                const mapCache404 = FireJSX.cache["/404"];
                if (mapCache404)
                    return resolve(FireJSX.cache[url] = mapCache404);
                //load 404
                this.loadMap("/404")
                    .then(() => {
                        console.log(url)
                        resolve(FireJSX.cache[url] = FireJSX.cache["/404"])
                    })
                    .catch(reject);
            };
        })
    },
    async preloadPage(url) {
        url = getPathFromUrl(url);
        if (FireJSX.cache[url])
            return;
        const {chunks} = await this.loadMap(url);
        chunks.initial.forEach(c => this.preloadChunk(c, "prefetch"));
    },
    async loadPage(url, pushState = true) {
        if (this.lock)
            return;
        this.lock = true;
        if (pushState)
            window.history.pushState(undefined, undefined, FireJSX.prefix + url);
        url = getPathFromUrl(url);//url
        //map
        let cacheMap = FireJSX.cache[url];
        if (!cacheMap)
            cacheMap = await this.loadMap(url);
        if (!cacheMap.app)
            cacheMap.chunks.initial.forEach((c) => this.loadChunk(c));
        else
            FireJSX.run(url)
    },
    preloadChunk(chunk, rel) {
        //false when preloaded, undefined if neither loaded nor preloaded
        if (this.chunksStatusMap[chunk] === false)
            return;
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
