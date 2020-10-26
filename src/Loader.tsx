import * as React from "react";
import FireJSX from "./types/FireJSX";

export default ({children, effect, delay}) => {
    if (!effect)
        throw new TypeError("You forgot to pass React.useEffect as effect to Loader");

    if (typeof effect !== 'function')
        throw new TypeError("effect prop passed to Loader must be a function i.e React.useEffect");

    const [loader, setLoader] = React.useState(children);

    React.useEffect(() => {
        //register the functions on mount
        FireJSX.showLoader = () => void setLoader(children);
        FireJSX.hideLoader = () => void setLoader(<></>);
        //on unmount de register the showLoader and hideLoader function
        return () => FireJSX.hideLoader = FireJSX.showLoader = undefined;
    }, [])
    //call effect
    effect(() => {
        //if delay then setTimeout else hide the loader right away
        const timeout = delay ?
            setTimeout(FireJSX.hideLoader, delay) :
            void setLoader(FireJSX.hideLoader)
        //on unmount clear the timeout if any
        return () => timeout ? clearTimeout(timeout) : undefined;
    }, [])

    return loader;
}
