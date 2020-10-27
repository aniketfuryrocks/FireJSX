import Page from "../../dist/Page";
import LoadingBar from "./components/LoadingBar/LoadingBar";
import Loader from "../../dist/Loader";

FireJSX.app = props => {
    return <>
        <Loader>
            <LoadingBar/>
        </Loader>
        <Page {...props} />
    </>
}
