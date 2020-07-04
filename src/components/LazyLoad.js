let count = 0;

export default (chunkFunc, {
    ssr = true, script, placeHolder = <div suppressHydrationWarning={true}></div>, onError = (e) => {
        console.error("Error while lazy loading ");
        throw new Error(e);
    }
} = {}) => {
    if (script && ssr)
        throw new Error("Scripts can't be rendered. Set either script or ssr to false");
    //id
    let id = `FireJSX_LAZY_${count++}`;
    let props;
    let setChild;

    async function starter() {
        try {
            const chunk = await chunkFunc();
            if (!script)
                if (FireJSX.isSSR && ssr)
                    document.getElementById(id).outerHTML = window.ReactDOMServer.renderToString(
                        React.createElement(chunk.default, props, props.children)
                    );
                else
                    setChild(React.createElement(chunk.default, {
                        ...props,
                        suppressHydrationWarning: true
                    }, props.children))
        } catch (e) {
            onError(e)
        }
    }

    if (FireJSX.isSSR && ssr)
        FireJSX.lazyPromises.push(starter)
    else
        starter()

    if (!script)
        return function (_props) {
            const [child, _setChild] = React.useState(FireJSX.isSSR ? <div id={id}/> : placeHolder);
            setChild = _setChild;
            props = _props;
            return child
        }
}