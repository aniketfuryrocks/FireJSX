import {hot} from "react-hot-loader/root";
import * as React from "react";

FireJSX.app = hot(({app, content}) => {
    const [App, setApp] = React.useState(React.createElement(app, {content}));

    React.useEffect(() => {
        FireJSX.setApp = (app, content) => {
            // @ts-ignore
            setApp(React.createElement(app, {content}));
        }
        //make undefined to prevent illegal state access
        return () => FireJSX.setApp = undefined
    }, [])

    return App
})
