import LazyLoad from "../../../src/components/LazyLoad";

export default function () {
    const Markdown = LazyLoad(() => import("../components/Markdown/Markdown.jsx"), () => require.resolveWeak("../components/Markdown/Markdown.jsx"))
    return (
        <div>
            Hello
            <Markdown>
                # This is a lazy loaded component
            </Markdown>
        </div>
    )
}
