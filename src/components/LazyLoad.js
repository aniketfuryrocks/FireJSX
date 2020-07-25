export default (loadFunc,
                resolveID,
                placeHolder = () => <></>) => {
    if (FireJSX.isSSR && resolveID)
        return __webpack_require__(resolveID()).default

    return props => {
        const [child, setChild] = React.useState(placeHolder());
        React.useEffect(() => {
            loadFunc()
                .then(Chunk => setChild(<Chunk.default {...props} suppressHydrationWarning={true}/>))
                .catch(e => setChild(placeHolder(e)))
        }, [])
        return child
    }
}