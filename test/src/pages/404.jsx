import Wrap from "../../../src/components/Wrap.js";
import {hot} from "firejsx/Hot"
import Markdown from "../components/Markdown/Markdown.jsx";
import Link from "../../../src/components/Link.js";
import Head from "../../../dist/Head.js";
import LoadingCircle from "../components/LoadingCircle/LoadingCircle.jsx";
import "../style/main.css"
import Loader from "../../../src/components/Loader.js";

Wrap(() => {
    return (
        <div>
            <Head>
                <title>404</title>
            </Head>
            <Loader effect={React.useEffect} delay={800}>
                <LoadingCircle/>
            </Loader>
            <h1>😿 OH NO 404</h1>
            <br/>
            <Markdown>
                By the way, I am a lazy loaded component 😺
            </Markdown>
            <br/>
            <br/>
            <br/>
            <Link href={"/"}> 👻 Click Here To Go Home</Link>
        </div>
    )
}, hot)