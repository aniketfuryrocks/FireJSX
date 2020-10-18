FireJSX.linkApi.lock = false;
(FireJSX.isHydrated ? ReactDOM.hydrate : ReactDOM.render)
(<FireJSX.app content={FireJSX.map[location.pathname]}/>, document.getElementById("root"));
if (location.hash) {
    const el = document.getElementById(decodeURI(location.hash.substring(1)))
    if (el)
        el.scrollIntoView()
}
//after render it's no more hydrated
FireJSX.isHydrated = false;
