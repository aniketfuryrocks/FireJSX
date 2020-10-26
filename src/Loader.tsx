import * as React from "react";

export default ({children, delay}) => {
    const [loader, setLoader] = React.useState(children);

    React.useEffect(() => {
        //register the functions on mount
        FireJSX.showLoader = () => void setLoader(children);
        FireJSX.hideLoader = () => void setLoader(<></>);
        //on unmount de register the showLoader and hideLoader function
        return () => FireJSX.hideLoader = FireJSX.showLoader = undefined;
    }, [])
    //call effect
    React.useEffect(() => {
        //if delay then setTimeout else hide the loader right away
        const timeout = delay ?
            setTimeout(FireJSX.hideLoader, delay) :
            void setLoader(FireJSX.hideLoader)
        //on unmount clear the timeout if any
        return () => timeout ? clearTimeout(timeout) : undefined;
    }, [])

    return loader;
}
