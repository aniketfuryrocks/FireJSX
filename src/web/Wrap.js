export default function (module_exports) {
    if (!module_exports)
        throw new Error("looks like you did not export any thing from page. Visit quick start guide to get started. https://github.com/eAdded/FireJSX/wiki/Quick-Start")
    const App = module_exports.default;
    if (!App)
        throw new Error(`You forgot to export a default function. Visit quick start guide to get started. https://github.com/eAdded/FireJSX/wiki/Quick-Start"`);
    if (FireJSX.isSSR)
        FireJSX.app = App;
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
