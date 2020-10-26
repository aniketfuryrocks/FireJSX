import * as React from "react";

export default ({href, children, onClick, onMouseEnter, ...rest}) => {
    const [preLoaded, setPreLoaded] = React.useState(false)

    function preLoad() {
        if (onMouseEnter)
            onMouseEnter()
        if (preLoaded)
            return;
        FireJSX.linkApi.preloadPage(href).then(() => setPreLoaded(true));
    }

    function apply(event) {
        event.preventDefault();
        if (onClick)
            onClick(event)
        if (FireJSX.showLoader)
            FireJSX.showLoader();
        FireJSX.linkApi.loadPage(href, false);
    }

    return (
        <a {...rest} href={FireJSX.prefix + href} onClick={apply.bind(this)} onMouseEnter={preLoad.bind(this)}>
            {children}
        </a>
    )
}
