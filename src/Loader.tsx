import * as React from "react";

export default ({children, delay}) => {
    const [loader, setLoader] = React.useState(children);

    React.useEffect(() => {
        let timeout;
        //register the functions on mount
        FireJSX.showLoader = () => {
            console.log("showing loader")
            if (timeout)
                clearTimeout(timeout)
            setLoader(children);
            timeout = delay ? setTimeout(() => {
                if (!timeout)
                    FireJSX.hideLoader()
                timeout = undefined
            }, delay) : undefined
        }

        FireJSX.hideLoader = () => {
            if (timeout) {
                timeout = undefined;
                return;
            }
            console.log("hiding loader")
            void setLoader(<></>);
        }

        FireJSX.hideLoader();
        //on unmount de register the showLoader and hideLoader function
        return () => {
            console.log("unmounting")
            timeout ? clearTimeout(timeout) : null;
            FireJSX.hideLoader = FireJSX.showLoader = undefined;
        }
    }, []);

    return loader;
}
