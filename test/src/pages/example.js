import Link from "../../../src/components/Link.js";
import Head from "../../../src/components/Head.js";
import LazyLoad from "../../../src/components/LazyLoad.js";
import Loader from "../../../src/components/Loader.js";

FireJSX.app = () => {
    const Markdown = LazyLoad(()=> import("markdown-to-jsx"));
    return (
        <div>
            <Head>
                <title>Index Page</title>
            </Head>
            <Loader effect={React.useEffect} delay={800}>
                This text will appear before full page load
                //use Loader on page root, delay is optional
            </Loader>
            <br/><br/>
            <Link href="/about">Link to About Page</Link>
            <Markdown>
                # This is a lazy loaded component
            </Markdown>
        </div>
    )
}