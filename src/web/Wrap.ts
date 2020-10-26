export default function (app) {
    const path = decodeURI(location.pathname);
    FireJSX.cache[path].app = app;
    console.log(FireJSX)
    if (!FireJSX.isSSR)
        FireJSX.run(path);
}
