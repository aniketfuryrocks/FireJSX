import Link from "../../../src/components/Link.js";
import Head from "../../../src/components/Head.js";
import "../style/main.css"
import Loader from "../../../src/components/Loader.js";
import LoadingBar from "../components/LoadingBar/LoadingBar.js";

export default ({content: {emoji}}) => {
    const [s, setS] = React.useState(0)
    React.useEffect(() => {
        let t = 0;
        const interval = setInterval(() => setS(t++), 1000);
        return () => {
            clearInterval(interval);
        }
    }, []);

    return (
        <div>
            <Loader effect={React.useEffect}>
                <LoadingBar/>
            </Loader>
            <Head>
                <title>Index</title>
            </Head>
            <h1>Welcome to FireJS <img height={30} width={30} src={FireJSX.addStaticPrefix("/fire.svg")}/></h1>
            <br/>
            You have been here for {s}s {emoji}
            <br/>
            <br/>
            <Link href={"/about"}>🤠 Click Here To Go To About Page</Link>
            <br/>
            <br/>
            <Link href={"/this page does not exist"}>🤔 Click Here To Go Mock 404</Link>
        </div>
    )
}