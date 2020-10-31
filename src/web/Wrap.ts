export default function (page, app, hot) {
    app = FireJSX.pagesCache[page].app = hot ? hot(app) : app;
    if (!FireJSX.isSSR)
        FireJSX.run(app);
}
