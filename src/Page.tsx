export default function ({app, content}) {
    const [App, setApp] = React.useState(React.createElement(app, {content}));
    React.useEffect(() => {
        FireJSX.setApp = (app, content) => {
            // @ts-ignore
            setApp(React.createElement(app, {content}));
            if (FireJSX.hideLoader)
                FireJSX.hideLoader()
        }
        //make undefined to prevent illegal state access
        return () => FireJSX.setApp = undefined
    }, [])
    return App;
}

