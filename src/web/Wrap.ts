export default function (app) {
    let path = decodeURI(location.pathname);
    console.log(path)
    if (!FireJSX.cache[path])
        path = "/404";
    FireJSX.cache[path].app = app;
    if (!FireJSX.isSSR)
        FireJSX.run(path);
}
