import "../style/main.css"
import Link from "../../../dist/Link";
import Head from "../../../dist/Head";

/*
const Markdown = LazyLoad(() => import("../components/Markdown/Markdown.jsx"))
*/

export default function App() {
    return (
        <div>
            <Head>
                <title>404</title>
            </Head>
            <h1>😿 OH NO 404</h1>
            <br/>
            {/*<Markdown>
                By the way, I am a lazy loaded component 😺
            </Markdown>*/}
            <br/>
            <br/>
            <Link href={"/"}> 👻 Click Here To Go Home</Link>
        </div>
    )
}
