import * as React from "react";

export default ({href, children, onClick, onMouseEnter, ...rest}: {
    href: string
    children: JSX.Element
    onClick?: (Event) => void
    onMouseEnter?: (Event) => void
}) => {

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
        FireJSX.linkApi.loadPage(href);
    }

    return (
        <a {...rest} href={FireJSX.prefix + href} onClick={apply} onMouseEnter={preLoad}>
            {children}
        </a>
    )
}
