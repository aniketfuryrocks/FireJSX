import {hot} from "react-hot-loader/root";
import * as React from "react";
import useAppHelper from "./helper";

FireJSX.app = hot(props => {
    return useAppHelper(props)
})
