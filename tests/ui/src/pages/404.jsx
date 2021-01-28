import Link from "firejsx/Link";
import Head from "firejsx/Head";
import LazyLoad from "firejsx/LazyLoad";

export default () => {
    const Markdown = LazyLoad(() => import("../components/Markdown/Markdown.jsx"))

    return (
        <div>
            <Head>
                <title>404</title>
            </Head>
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
}
