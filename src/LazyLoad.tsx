import FireJSX from "./types/FireJSX";
import * as React from "react";

export default function (loadFunc: () => Promise<any>,
                         resolveID: () => string,
                         placeHolder: (any) => JSX.Element): any {
    if (placeHolder)
        placeHolder = () => <></>
    if (FireJSX.isSSR && resolveID) { // @ts-ignore
        return __webpack_require__(resolveID()).default
    }
    let mounted = true;
    return props => {
        const [child, setChild] = React.useState(placeHolder(undefined));
        React.useEffect(() => {
            loadFunc()
                .then(Chunk => mounted ? setChild(<Chunk.default {...props} suppressHydrationWarning={true}/>) : {})
                .catch(e => mounted ? setChild(placeHolder(e)) : {})
            return () => mounted = false;
        }, [])
        return child
    }
}
