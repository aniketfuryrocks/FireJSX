window.onpopstate = function () {
    //remove prefix
    const path = location.pathname.replace(FireJSX.prefix, "");
    FireJSX.linkApi.preloadPage(path, function () {
        FireJSX.linkApi.loadPage(path, false)
    })
}

if (FireJSX.isHydrated)
    FireJSX.linkApi.runApp(ReactDOM.hydrate)
else
    FireJSX.linkApi.runApp()