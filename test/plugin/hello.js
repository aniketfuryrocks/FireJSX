exports.default = function ({onBuild, initWebpack}, $) {
    $.cli.log("[HELLO] I was called")
    onBuild("index.js", ({renderPage}) => {
            renderPage("/index", {emoji: "🔥"})
        }
    )
    onBuild("about.js", ({renderPage}) => {
            renderPage("/hola")
            renderPage("/about")
        }
    )
}