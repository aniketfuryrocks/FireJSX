import {hot} from "react-hot-loader/root";
import * as React from "react";

FireJSX.app = hot((props: {
    app: JSX.Element,
    content: any
}) => {
    const [App, setApp] = React.useState(() => props.app)
    const [Content, setContent] = React.useState(props.content);

    React.useEffect(() => {
        FireJSX.setApp = (App, Content) => {
            setApp(App);
            setContent(Content);
        }
        //make undefined to prevent illegal state access
        return () => FireJSX.setApp = undefined
    }, [])

    // @ts-ignore
    return <App content={Content}/>
})
