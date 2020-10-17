export default function (app, hot) {
    if (!hot)
        throw new Error("You forgot to pass { hot } from firejsx/hot to Wrap")
    if (FireJSX.isSSR) {
        FireJSX.app = app
        return
    }
    FireJSX.linkApi.lock = false
    const func = FireJSX.isHydrated ? ReactDOM.hydrate : ReactDOM.render
    const App = FireJSX.isSSR ? app : hot(app)
    func(<App
        content={FireJSX.map[location.pathname === "/" ? "/index" : location.pathname]}/>, document.getElementById("root"))
    if (location.hash) {
        const el = document.getElementById(decodeURI(location.hash.substring(1)))
        if (el)
            el.scrollIntoView()
    }
    //after render it's no more hydrated
    FireJSX.isHydrated = false;
}
