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
    }, [])

    // @ts-ignore
    return <App content={Content}/>
})
