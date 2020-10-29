import "../../style/main.css";
import Link from "../../../../dist/Link";
import Head from "../../../../dist/Head";
import LazyLoad from "../../../../dist/LazyLoad";


export default function App() {
    const Markdown = LazyLoad(() => import("../../components/Markdown/Markdown.jsx"), () => require.resolveWeak("../../components/Markdown/Markdown.jsx"))

    return (
        <div>
            <Head>
                <title>About</title>
                <meta name={"asd"}/>
            </Head>
            <Markdown>
                By the way, I am a lazy loaded component 😺
            </Markdown>
            <h1>This is the about pages</h1>
            <br/>
            <Link href={"/"}> 👻 Click Here To Go Home. Ha ha </Link>
        </div>
    )
}
