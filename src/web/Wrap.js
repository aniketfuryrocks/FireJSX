export default function (module_exports) {
    const App = module_exports.default
    //check if page exports a named function only in development
    if (!App || (process.env.NODE_ENV === 'development' && (!App.name || App.name === "_default")))
        throw new Error(`You forgot to export a default named function. Visit quick start guide to get started. https://github.com/eAdded/FireJSX/wiki/Quick-Start"`);
    FireJSX.isSSR ? FireJSX.app = App : {};
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
