import "../style/main.css"
import Link from "../../../src/Link.tsx";
import Head from "../../../src/Head.ts";
import Loader from "../../../src/components/Loader.ts";
import LoadingBar from "../components/LoadingBar/LoadingBar.jsx";

export default function App({content: {emoji}}) {
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
            <h1>Welcome to FireJSX <img height={30} width={30} src={`${FireJSX.staticPrefix}/fire.svg`}/></h1>
            <br/>
            You asd been here asd for {s}s {emoji}
            <br/>
            <br/>
            <Link href={"/about?s=h"}>🤠 Click Here To Go To About Page</Link>
            <br/>
            <br/>
            <Link href={"/this page does not exist"}>🤔 Click Here To Go Mock 404</Link>
        </div>
    )
}
