export default function (app) {
    let path = decodeURI(location.pathname);
    const li = path.lastIndexOf("/index")
    if (path.endsWith("/index"))
        path = li <= 0 ? "/" : path.substring(0, li);
    path = path.replace(FireJSX.prefix, "");

    if (!FireJSX.cache[path])
        path = "/404";
    FireJSX.cache[path].app = app;
    if (!FireJSX.isSSR)
        FireJSX.run(path);
}
