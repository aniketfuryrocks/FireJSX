export default function (App, hot) {
    FireJSX.cache[location.pathname].app = App
    if (FireJSX.isSSR)
        return
    FireJSX.linkApi.run(
        hot ? hot(App) : App,
        FireJSX.cache[decodeURI(location.pathname)].content
    )
}
