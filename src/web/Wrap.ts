export default function (app) {
    let path = decodeURI(location.pathname);
    if (!FireJSX.cache[path])
        path = "/404";
    FireJSX.cache[path].app = app;
    if (!FireJSX.isSSR)
        FireJSX.run(path);
}
