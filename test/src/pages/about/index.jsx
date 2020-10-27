import "../../style/main.css";
import Link from "../../../../dist/Link";
import Head from "../../../../dist/Head";

export default function App() {
    return (
        <div>
            <Head>
                <title>About</title>
                <meta name={"asd"}/>
            </Head>
            <h1>This is the about pages</h1>
            <br/>
            <Link href={"/"}> 👻 Click Here To Go Home. Ha ha </Link>
        </div>
    )
}
