window.onpopstate = function () {
    const path = location.pathname.replace(FireJSX.prefix, "");//remove prefix
    FireJSX.linkApi.loadPage(path, false)
}

FireJSX.linkApi = {
    getMapUrl: url => `${FireJSX.prefix}/${FireJSX.lib}/map${url === "/" ? "/index" : url}.map.js`,
    loadMap: async function (url) {
        let text = await (await fetch(this.getMapUrl(url), {method: "GET"})).text()
        if (text)
            return JSON.parse(text.replace("FireJSX.map=", ""))
    },
    preloadPage: async function (url) {
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
        window.webpackJsonp = undefined
        const map = await this.loadMap(url);
        if (map) {
            this.loadChunks(map.chunks.entry)
            this.loadChunks(map.chunks.initial)
        } else if (url === "/404")
            throw new Error("404 page not found")
        else
            await this.loadChunks("/404")
        if (pushState)
            window.history.pushState(undefined, undefined, FireJSX.prefix + url);
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