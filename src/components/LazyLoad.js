export default (loadFunc,
                resolveID, {
                    placeHolder = <div suppressHydrationWarning={true}/>,
                    onError = (e) => {
                        console.error("Error while lazy loading ");
                        throw new Error(e);
                    }
                } = {}) => {
    if (FireJSX.isSSR && resolveID)
        return __webpack_require__(resolveID()).default

    return props => {
        const [child, setChild] = React.useState(placeHolder);
        React.useEffect(() => {
            loadFunc()
                .then(Chunk => setChild(<Chunk.default {...props} suppressHydrationWarning={true}/>))
                .catch(onError)
        }, [])
        return child
    }
}