export default function (App, hot) {
    if (!App)
        throw new Error(`You forgot to export a default function. Visit quick start guide to get started. https://github.com/eAdded/FireJSX/wiki/Quick-Start"`);
    App = FireJSX.isSSR ? FireJSX.app = App : hot ? hot(App) : App;
    FireJSX.linkApi.lock = false;
    (FireJSX.isHydrated ? ReactDOM.hydrate : ReactDOM.render)
    (React.createElement(App, {content: FireJSX.map[location.pathname]}), document.getElementById("root"));
    if (location.hash) {
        const el = document.getElementById(decodeURI(location.hash.substring(1)))
        if (el)
            el.scrollIntoView()
    }
    FireJSX.isHydrated = false;
}
