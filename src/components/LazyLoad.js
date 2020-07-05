let count = 0;

export default (chunkFunc, {
    ssr = true, placeHolder = <div suppressHydrationWarning={true}/>, onError = (e) => {
        console.error("Error while lazy loading ");
        throw new Error(e);
    }
} = {}) => {
    let id = `FireJSX_LAZY_${count++}`;
    let props;
    let setChild;

    async function starter() {
        try {
            const chunk = await chunkFunc();
            if (FireJSX.isSSR && ssr) {
                const el = document.getElementById(id)
                if (el)
                    el.outerHTML = window.ReactDOMServer.renderToString(
                        React.createElement(chunk.default, props)
                    );
            } else
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

    return (_props) => {
        const [child, _setChild] = React.useState(FireJSX.isSSR ? <div id={id}/> : placeHolder);
        setChild = _setChild;
        props = _props;
        React.useEffect(() => {
            starter()
        }, [])
        return child
    }
}