export default function (app, hot) {
    if (FireJSX.isSSR) {
        global.__FIREJSX_APP__ = app
        return
    }
    const func = FireJSX.isHydrated ? ReactDOM.hydrate : ReactDOM.render
    const App = FireJSX.isSSR ?
        app : hot(props => React.createElement(app, props))

    func(<App content={FireJSX.map.content}/>, document.getElementById("root"))
    //load async chunks
    FireJSX.linkApi.preloadChunks(FireJSX.map.chunks.async)
    FireJSX.linkApi.loadChunks(FireJSX.map.chunks.async)
    //after render it's no more hydrated
    FireJSX.isHydrated = false;
}