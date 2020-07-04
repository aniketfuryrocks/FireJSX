export default ({to, children, className, style}) => {
    let wasLoaded = false;

    function preLoad(event, callback) {
        if (wasLoaded)
            return;
        FireJSX.linkApi.preloadPage(to, callback || function () {
            wasLoaded = true;
        });
    }

    function apply(event) {
        if (FireJSX.showLoader)
            FireJSX.showLoader();
        event.preventDefault();
        if (!wasLoaded)//there is no muse enter in mobile devices
            preLoad(undefined, () => FireJSX.linkApi.loadPage(to));
        else
            FireJSX.linkApi.loadPage(to);
    }

    return (
        <a href={to} style={style} className={className} onClick={apply.bind(this)} onMouseEnter={preLoad.bind(this)}>
            {children}
        </a>
    )
}