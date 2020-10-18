import Wrap from "../../../src/web/Wrap.js";
import {hot} from "firejsx/Hot"
import "../style/main.css"
import Head from "../../../dist/Head.js";
import LazyLoad from "../../../dist/LazyLoad.js";
import LoadingCircle from "../components/LoadingCircle/LoadingCircle";
import Link from "../../../src/components/Link.js";
import Loader from "../../../src/components/Loader.js";

Wrap(() => {
    const Markdown = LazyLoad(() => import("../components/Markdown/Markdown.jsx"), () => require.resolveWeak("../components/Markdown/Markdown.jsx"))
    return (
        <div>
            <Head>
                <title>404</title>
            </Head>
            <Loader effect={React.useEffect} delay={500}>
                <LoadingCircle/>
            </Loader>
            <h1>😿 OH NO 404</h1>
            <br/>
            <Markdown>
                By the way, I am a lazy loaded component 😺
            </Markdown>
            <br/>
            <br/>
            <Link href={"/"}> 👻 Click Here To Go Home</Link>
        </div>
    )
}, hot)
