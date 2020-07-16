export default function (app) {
    const func = FireJSX.isHydrated ? ReactDOM.hydrate : ReactDOM.render
    const App = FireJSX.isSSR ?
        app :
        require('react-hot-loader/root').hot(
            props => React.createElement(app, props))

    func(React.createElement(App, {content: FireJSX.map.content}), document.getElementById("root"))
    //load async chunks
    FireJSX.linkApi.preloadChunks(FireJSX.map.chunks.async)
    FireJSX.linkApi.loadChunks(FireJSX.map.chunks.async)
    //after render it's no more hydrated
    FireJSX.isHydrated = false;
}