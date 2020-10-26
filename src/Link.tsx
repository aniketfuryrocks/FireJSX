import * as React from "react";

export default ({href, children, onClick, onMouseEnter, ...rest}) => {

    const preLoad = (e) => {
        e.preventDefault();
        if (onMouseEnter)
            onMouseEnter(e)
        FireJSX.linkApi.preloadPage(href);
    }

    const apply = (e) => {
        e.preventDefault();
        if (onClick)
            onClick(e)
        if (FireJSX.showLoader)
            FireJSX.showLoader();
        FireJSX.linkApi.loadPage(href);
    }

    return (
        <a {...rest} href={FireJSX.prefix + href} onClick={apply} onMouseEnter={preLoad}>
            {children}
        </a>
    )
}
