FireJSX.lazyCount = 0;
FireJSX.lazyDone = 0;
export default (chunk, {
    ssr = true, script, delay = 0, placeHolder = <></>, onError = (e) => {
        console.error("Error while lazy loading ");
        throw new Error(e);
    }
} = {}) => {
    FireJSX.lazyCount++;
    if (script && ssr)
        throw new Error("Scripts can't be rendered. Set either script or ssr to false");
    let id;
    if (FireJSX.isSSR) {
        delay = 0;
        placeHolder = (<div id={id = `FireJSX_LAZY_${FireJSX.lazyCount}`}/>)
    }
    let props = {};
    let setChild;

    function load(chunk) {
        FireJSX.lazyDone++;
        if (!script) {
            if (FireJSX.isSSR && ssr) {
                document.getElementById(id).innerHTML = window.ReactDOMServer.renderToString(
                    React.createElement(chunk.default, props, props.children)
                );
            } else
                setChild(React.createElement(chunk.default, props, props.children))
        }
        if (FireJSX.lazyDone === FireJSX.lazyCount && FireJSX.isSSR)
            FireJSX.finishRender();
    }

    if (!(FireJSX.isSSR && script))
        chunk().then(chunk => {
                if (!delay)
                    load(chunk);
                else
                    setTimeout(() => load(chunk), delay);
            }
        ).catch(onError)
    else if ((++FireJSX.lazyDone) === FireJSX.lazyCount && FireJSX.isSSR)
        FireJSX.finishRender();

    if (!script)
        return function (_props) {
            props = _props;
            const [child, _setChild] = React.useState(placeHolder);
            setChild = _setChild;
            return (
                <div suppressHydrationWarning={true}>
                    {child}
                </div>
            );
        }
}