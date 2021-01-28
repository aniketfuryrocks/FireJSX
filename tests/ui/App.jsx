import "./src/style/main.css"
import Page from "firejsx/Page";
import LoadingBar from "./src/components/LoadingBar/LoadingBar";
import Loader from "firejsx/Loader";

FireJSX.app = props => {
    return <>
        <Loader delay={10}>
            <LoadingBar/>
        </Loader>
        <Page {...props} />
    </>
}
