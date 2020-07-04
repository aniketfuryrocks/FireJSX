export default ({children, effect, delay}) => {
    if (!effect)
        throw new Error("You forgot to pass React.useEffect as effect to Loader");
    const [loader, setLoader] = React.useState(children);
    FireJSX.showLoader = () => {
        FireJSX.showLoader = undefined;
        setLoader(children)
    };
    effect(() => {
        if (delay)
            setTimeout(() => setLoader(<></>), delay)
        else
            setLoader(<></>)
    }, [])
    return loader;
}