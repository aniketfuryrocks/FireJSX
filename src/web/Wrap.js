export default function (App, hot) {
    if (FireJSX.isSSR) {
        FireJSX.app = App
        return
    }
    FireJSX.linkApi.lock = false
    const func = FireJSX.isHydrated ? ReactDOM.hydrate : ReactDOM.render
    App = hot ? hot(App) : App;
    func(<App content={FireJSX.map.content}/>, document.getElementById("root"))
    if (location.hash) {
        const el = document.getElementById(decodeURI(location.hash.substring(1)))
        if (el)
            el.scrollIntoView()
    }
    //after render it's no more hydrated
    FireJSX.isHydrated = false;
}
