import * as React from "react";

export default function useAppHelper({app, content}) {
    const [App, setApp] = React.useState(React.createElement(app, {content}));
    React.useEffect(() => {
        FireJSX.setApp = (app, content) => {
            // @ts-ignore
            setApp(React.createElement(app, {content}));
        }
        //make undefined to prevent illegal state access
        return () => FireJSX.setApp = undefined
    }, [])
    return App;
}

