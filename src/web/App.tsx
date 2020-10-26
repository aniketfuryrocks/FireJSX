import {hot} from "react-hot-loader/root";
import * as React from "react";
import Page from "./Page";

FireJSX.app = hot(props => {
    return <Page {...props} />
})
