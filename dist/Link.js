export default ({href, children, onClick, onMouseEnter, ...rest}) => {
    const [preLoaded, setPreLoaded] = React.useState(false)

    function preLoad(event, callback) {
        if (onMouseEnter)
            onMouseEnter()
        if (preLoaded)
            return;
        FireJSX.linkApi.preloadPage(href, callback || function () {
            setPreLoaded(true)
        });
    }

    function apply(event) {
        if (onClick)
            onClick()
        if (FireJSX.showLoader)
            FireJSX.showLoader();
        event.preventDefault();
        if (!preLoaded)//there is no muse enter in mobile devices
            preLoad(undefined, () => FireJSX.linkApi.loadPage(href));
        else
            FireJSX.linkApi.loadPage(href);
    }

    return (
        <a {...rest} href={href} onClick={apply.bind(this)} onMouseEnter={preLoad.bind(this)}>
            {children}
        </a>
    )
}