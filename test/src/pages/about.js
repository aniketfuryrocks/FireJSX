import Link from "../../../src/components/Link.js";
import "../style/main.css"
import Head from "../../../src/components/Head.js";
import Loader from "../../../src/components/Loader.js";
import LoadingBar from "../components/LoadingBar/LoadingBar.js";

export default () => {
    return (
        <div>
            <Head>
                <title>About</title>
            </Head>
            <Loader effect={React.useEffect}>
                <LoadingBar/>
            </Loader>
            <h1>This is the about page</h1>
            <br/>
            <Link to={"/"}> 👻 Click Here To Go Home. Ha ha </Link>
        </div>
    )
}