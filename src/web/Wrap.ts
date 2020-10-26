export default function (app) {
    const path = decodeURI(location.pathname);
    FireJSX.cache[path].app = app;
    if (!FireJSX.isSSR)
        FireJSX.run(path);
}
