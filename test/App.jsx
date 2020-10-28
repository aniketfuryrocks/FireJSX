import Page from "../dist/Page";
import LoadingBar from "./src/components/LoadingBar/LoadingBar";
import Loader from "../dist/Loader";

FireJSX.app = props => {
    return <>
        <Loader delay={10}>
            <LoadingBar/>
        </Loader>
        <Page {...props} />
    </>
}
