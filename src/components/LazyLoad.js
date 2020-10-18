export default (loadFunc,
                resolveID,
                placeHolder = () => <></>) => {
    if (FireJSX.isSSR && resolveID)
        return __webpack_require__(resolveID()).default
    let mounted = true;
    return props => {
        const [child, setChild] = React.useState(placeHolder());
        React.useEffect(() => {
            loadFunc()
                .then(Chunk => mounted ? setChild(<Chunk.default {...props} suppressHydrationWarning={true}/>) : {})
                .catch(e => mounted ? setChild(placeHolder(e)) : {})
            return () => mounted = false;
        }, [])
        return child
    }
}
