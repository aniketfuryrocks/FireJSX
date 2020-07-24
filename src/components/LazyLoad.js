export default (loadFunc,
                resolveID, {
                    ssr = true, placeHolder = <div suppressHydrationWarning={true}/>, onError = (e) => {
            console.error("Error while lazy loading ");
            throw new Error(e);
        }
                } = {}) => {
    let props;
    let setChild;

    if (FireJSX.isSSR && ssr)
        return __webpack_require__(resolveID()).default
    else
        loadFunc().then(chunk => {
            setChild(React.createElement(chunk.default, {
                ...props,
                suppressHydrationWarning: true
            }, props.children))
        }).catch(onError)

    return (_props) => {
        const [child, _setChild] = React.useState(FireJSX.isSSR ? <div id={id}/> : placeHolder);
        setChild = _setChild;
        props = _props;
        return child
    }
}