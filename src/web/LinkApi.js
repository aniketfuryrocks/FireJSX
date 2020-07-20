window.onpopstate = function () {
    const path = location.pathname.replace(FireJSX.prefix, "");//remove prefix
    FireJSX.linkApi.preloadPage(path, () => FireJSX.linkApi.loadPage(path, false))
}

FireJSX.linkApi = {
    getMapUrl: url => `${FireJSX.prefix}/${FireJSX.lib}/map${url === "/" ? "/index" : url}.map.js`,
    loadMap: function (url) {
        const map_script = document.createElement("script");
        map_script.src = this.getMapUrl(url);
        document.head.appendChild(map_script);
        return map_script;
    },
    preloadPage: function (url, callback) {
        const map_script = this.loadMap(url);
        map_script.onload = () => {
            this.preloadChunks(FireJSX.map.chunks.initial, "prefetch");
            this.preloadChunks(FireJSX.map.chunks.entry, "prefetch");
            callback();
        };
        map_script.onerror = () => {
            document.head.removeChild(map_script);
            this.loadMap("/404").onload = map_script.onload;
        };
    },
    loadPage: function (url, pushState = true) {
        window.webpackJsonp = undefined
        const script = document.createElement("script");
        script.src = `${FireJSX.prefix}/${FireJSX.lib}/${FireJSX.map.chunks.entry[0]}`
        this.loadChunks(FireJSX.map.chunks.initial);
        document.body.appendChild(script);
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