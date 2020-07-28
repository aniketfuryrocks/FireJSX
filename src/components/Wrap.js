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
    func(<App content={FireJSX.map.content}/>, document.getElementById("root"))
    //after render it's no more hydrated
    FireJSX.isHydrated = false;
}