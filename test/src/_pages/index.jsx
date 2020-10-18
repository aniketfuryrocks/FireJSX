import LazyLoad from "../../../src/components/LazyLoad";
import LoadingCircle from "../components/LoadingCircle/LoadingCircle";
import Loader from "../../../src/components/Loader";

export default function () {
    const Markdown = LazyLoad(() => import("../components/Markdown/Markdown.jsx"), () => require.resolveWeak("../components/Markdown/Markdown.jsx"))
    return (
        <div>
            Hello
            <Markdown>
                # This is a lazy loaded component
            </Markdown>
            <Loader effect={React.useEffect} delay={800}>
                <LoadingCircle/>
            </Loader>
        </div>
    )
}
