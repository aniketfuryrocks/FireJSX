import Head from "firejsx/Head";
import Link from "firejsx/Link";

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
            <Head>
                <title title={"index-counter"}>Index</title>
            </Head>
            <h1>Welcome to FireJSX <img height={30} width={30} src={`${FireJSX.staticPrefix}/fire.svg`}/></h1>
            <br/>
            You have been here for {s}s {emoji}
            <br/>
            <br/>
            <Link href={"/about?s=h"}>🤠 Click Here To Go To About Page</Link>
            <br/>
            <br/>
            <Link href={"/this page does not exist"}>🤔 Click Here To Go Mock 404</Link>
            <br/>
            <br/>
            <Link href={"/template_index"}>🤔 Click Here see a list of dynamic/template pages</Link>
        </div>
    )
}
