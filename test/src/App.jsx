import Page from "../../dist/Page";
import LoadingBar from "./components/LoadingBar/LoadingBar";
import Loader from "../../dist/Loader";

FireJSX.app = props => {
    return <>
        <Loader delay={200}>
            <LoadingBar/>
        </Loader>
        <Page {...props} />
    </>
}
