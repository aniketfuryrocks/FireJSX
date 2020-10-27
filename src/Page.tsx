import {FunctionComponent} from "react";

export default function ({app, content, ...extra}: {
    app: FunctionComponent,
    content: any,
    [key: string]: any
}) {
    const [App, setApp] = React.useState(React.createElement<any>(app, {content, ...extra}));
    React.useEffect(() => {
        FireJSX.setApp = (app, content) => {
            // @ts-ignore
            setApp(React.createElement(app, {content, ...extra}));
            if (FireJSX.hideLoader)
                FireJSX.hideLoader();
        }
        //make undefined to prevent illegal state access
        return () => FireJSX.setApp = undefined
    }, [])
    return App;
}

