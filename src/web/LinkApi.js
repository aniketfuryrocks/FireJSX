//listens to next and prev page events
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
        const foo = (resolve, reject) => {
            //force reload to refresh FireJSX.map value
            let ele = this.loadChunk(`map${url === "/" ? "/index" : url}.map.js`, true);
            console.log(ele)
            ele.onload = resolve;
            ele.onerror = () => {
                if (url === "/404")
                    throw new Error("Error loading 404 map")
                foo();
            };
        }
        return new Promise()
    },
    preloadPage: async function (url) {
        url = getPathFromUrl(url);
        try {
            await this.loadMap(url);
            FireJSX.chunks.entry.forEach(c => this.preloadChunk(c, "prefetch"));
            FireJSX.chunks.initial.forEach(c => this.preloadChunk(c, "prefetch"));
        } catch (_e) {
            if (url === "/404")
                throw new Error("404 page not found")
            await this.preloadPage("/404")
        }
    },
    loadPage: async function (url, pushState = true) {
        if (this.lock)
            return;
        this.lock = true
        window.webpackJsonp = undefined
        //push state
        if (pushState)
            window.history.pushState(undefined, undefined, FireJSX.prefix + url);
        url = getPathFromUrl(url);//url
        //map
        try {
            await this.loadMap(url);
            //force loading to run them
            FireJSX.chunks.entry.forEach(c => this.loadChunk(c, true));
            FireJSX.chunks.initial.forEach(c => this.loadChunk(c, true));
        } catch (_e) {
            if (url !== "/404") {
                this.lock = false
                await this.loadPage("/404", false)
            }
        }
    },
    preloadChunk: function (chunk, rel, force) {
        let ele = this.chunkCache[chunk];
        if (ele) { //check has already been loaded
            if (force)
                ele.remove()
            else
                return ele;
        }
        ele = document.createElement("link");
        ele.rel = rel;
        ele.href = `${FireJSX.prefix}/${FireJSX.lib}/${chunk}`;
        ele.crossOrigin = "anonymous";
        if (chunk.endsWith(".js"))
            ele.setAttribute("as", "script");
        else if (chunk.endsWith(".css"))
            ele.setAttribute("as", "style");
        document.head.appendChild(ele);
        this.chunkCache[chunk] = ele;
        return ele;
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
        this.chunkCache[chunk] = ele;
        return ele;
    }
}
