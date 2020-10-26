import * as React from "react";

FireJSX.run = function (path) {
    const {app, content} = FireJSX.cache[path];
    FireJSX.linkApi.lock = false;
    //update page if already rendered
    if (FireJSX.setApp)
        FireJSX.setApp(app, content);
    else {
        const func = FireJSX.isHydrated ? window.ReactDOM.hydrate : window.ReactDOM.render;
        func(React.createElement(FireJSX.app, {app, content}),
            document.getElementById("root"));
    }
    //scroll to hash
    if (location.hash) {
        const el = document.getElementById(decodeURI(location.hash.substring(1)))
        if (el)
            el.scrollIntoView()
    }
    //no more hydrated and locked
    FireJSX.isHydrated = false;
}
