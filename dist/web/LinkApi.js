FireJSX.linkApi = {
    getMapUrl: function (url) {
        return `/${FireJSX.mapRel}${url === "/" ? "/index" : url}.map.js`;
    },
    loadMap: function (url) {
        const map_script = document.createElement("script");
        map_script.src = this.getMapUrl(url);
        document.head.appendChild(map_script);
        return map_script;
    },
    preloadPage: function (url, callback) {
        const map_script = this.loadMap(url);
        map_script.onload = () => {
            this.preloadChunks(FireJSX.map.chunks, "prefetch");
            callback();
        };
        map_script.onerror = () => {
            document.head.removeChild(map_script);
            this.loadMap(FireJSX.pages["404"]).onload = map_script.onload;
        };
    },
    loadPage: function (url, pushState = true) {
        window.webpackJsonp_FIREJS_APP_ = undefined
        FireJSX.lazyCount = 0;
        FireJSX.lazyDone = 0;
        const script = document.createElement("script");
        script.src = `/${FireJSX.libRel}/${FireJSX.map.chunks.shift()}`
        this.loadChunks(FireJSX.map.chunks);
        script.onload = () => this.runApp()
        document.body.appendChild(script);
        if (pushState)
            window.history.pushState(undefined, undefined, url);
    },
    runApp: function (func = ReactDOM.render) {
        func(React.createElement(FireJSX.app, {content: FireJSX.map.content}),
            document.getElementById("root")
        );
        FireJSX.isHydrated = false;
    },
    preloadChunks: function (chunks, rel = "preload") {
        chunks.forEach(chunk => {
            const ele = document.createElement("link");
            ele.rel = rel;
            ele.href = `/${FireJSX.libRel}/${chunk}`;
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
                ele.src = `/${FireJSX.libRel}/${chunk}`
            } else {
                ele = document.createElement("link");
                ele.href = `/${FireJSX.libRel}/${chunk}`
                if (chunk.endsWith(".css"))
                    ele.rel = "stylesheet";
            }
            ele.crossOrigin = "anonymous";
            document.body.appendChild(ele);
        });
    }
}