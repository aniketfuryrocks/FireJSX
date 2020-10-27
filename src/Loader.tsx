import * as React from "react";

export default ({children, delay}) => {
    const [loader, setLoader] = React.useState(children);

    React.useEffect(() => {
        let timeout;
        //register the functions on mount
        FireJSX.showLoader = () => {
            console.log("showing loader")
            //if delay then setTimeout else hide the loader right away
            if (timeout)
                clearTimeout(timeout)
            setLoader(children);
            // timeout = delay ?
            //     setTimeout(FireJSX.hideLoader, delay) :
            //     void FireJSX.hideLoader();
        }

        FireJSX.hideLoader = () => {
            console.log("hiding loader")
            void setLoader(<></>);
            clearTimeout(timeout)
            timeout = undefined;
        }

        FireJSX.hideLoader()
        //on unmount de register the showLoader and hideLoader function
        return () => {
            console.log("unmounting")
            timeout ? clearTimeout(timeout) : null;
            FireJSX.hideLoader = FireJSX.showLoader = undefined;
        }
    }, []);

    return loader;
}
