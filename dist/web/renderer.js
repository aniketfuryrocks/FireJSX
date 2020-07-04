window.onpopstate = function () {
    FireJSX.linkApi.preloadPage(location.pathname, function () {
        FireJSX.linkApi.loadPage(location.pathname, false)
    })
}

if (FireJSX.isHydrated)
    FireJSX.linkApi.runApp(ReactDOM.hydrate)
else
    FireJSX.linkApi.runApp()