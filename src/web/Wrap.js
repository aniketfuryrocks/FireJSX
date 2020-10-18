export default function (App) {
    if (!App)
        throw new Error(`export function as \nexports default function App(){\n//...code here\n}`);
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
