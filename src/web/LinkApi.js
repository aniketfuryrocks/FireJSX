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
    lock: false,
    getMapUrl: url => `${FireJSX.prefix}/${FireJSX.lib}/map${url === "/" ? "/index" : url}.map.js`,
    loadMap: async function (url) {
        const res = await fetch(this.getMapUrl(url), {method: "GET"})
        if (res.ok)
            return JSON.parse((await res.text()).replace("FireJSX.map=", ""))
    },
    preloadPage: async function (url) {
        url = getPathFromUrl(url)
        const map = await this.loadMap(url);
        if (map) {
            this.preloadChunks(map.chunks.entry, "prefetch")
            this.preloadChunks(map.chunks.initial, "prefetch")
        } else if (url === "/404")
            throw new Error("404 page not found")
        else
            await this.preloadPage("/404")
    },
    loadPage: async function (url, pushState = true) {
        if (this.lock)
            return
        this.lock = true
        window.webpackJsonp = undefined
        //push state
        if (pushState)
            window.history.pushState(undefined, undefined, FireJSX.prefix + url);
        //url
        url = getPathFromUrl(url)
        //map
        const map = await this.loadMap(url);
        FireJSX.map = map
        if (map) {
            this.loadChunks(map.chunks.entry)
            this.loadChunks(map.chunks.initial)
        } else if (url !== "/404") {
            this.lock = false
            return void await this.loadPage("/404", false)
        }
    },
    preloadChunks: function (chunks, rel = "preload") {
        chunks.forEach(chunk => {
            const ele = document.createElement("link");
            ele.rel = rel;
            ele.href = `${FireJSX.prefix}/${FireJSX.lib}/${chunk}`;
            ele.crossOrigin = "anonymous";
            if (chunk.endsWith(".js"))
                ele.setAttribute("as", "script");
            else if (chunk.endsWith(".css"))
                ele.setAttribute("as", "style");
            document.head.appendChild(ele);
        })
    },
    loadChunks: function (chunks) {
        chunks.forEach(chunk => {
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
        });
    }
}
