import * as React from "react";

export default ({children, delay}) => {
    const [loader, setLoader] = React.useState(children);

    React.useEffect(() => {
        //register the functions on mount
        FireJSX.showLoader = () => void setLoader(children);
        FireJSX.hideLoader = () => void setLoader(<></>);
        //if delay then setTimeout else hide the loader right away
        const timeout = delay ?
            setTimeout(FireJSX.hideLoader, delay) :
            void setLoader(FireJSX.hideLoader);

        //on unmount de register the showLoader and hideLoader function
        return () => {
            timeout ? clearTimeout(timeout) : null;
            FireJSX.hideLoader = FireJSX.showLoader = undefined;
        }
    }, []);

    return loader;
}
