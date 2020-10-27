import Link from "../../../dist/Link";
import Head from "../../../dist/Head";
import LazyLoad from "../../../dist/LazyLoad";

export default function App() {
    const Markdown = LazyLoad(() => import("../components/Markdown/Markdown.jsx"), () => require.resolveWeak("../components/Markdown/Markdown.jsx"))
    return (
        <div>
            <Head>
                <title>Index Page</title>
            </Head>
            <br/><br/>
            <Link href="/about">Link to About Page</Link>
            <Markdown>
                # This is a lazy loaded component
            </Markdown>
        </div>
    )
}
