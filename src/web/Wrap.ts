import * as React from "react";

export default function (App, hot) {
    if (FireJSX.isSSR) {
        FireJSX.cache[location.pathname].app = App
        return
    }
    FireJSX.linkApi.lock = false
    App = hot ? hot(App) : App;
    let map = FireJSX.cache[decodeURI(location.pathname)];
    if (!map)
        map = FireJSX.cache["/404"]
    const func: any = FireJSX.isHydrated ? window.ReactDOM.hydrate : window.ReactDOM.render

    func(React.createElement(App, {content: map.content}), document.getElementById("root"))
    if (location.hash) {
        const el = document.getElementById(decodeURI(location.hash.substring(1)))
        if (el)
            el.scrollIntoView()
    }
    //after render it's no more hydrated
    FireJSX.isHydrated = false;
}
