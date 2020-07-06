exports.default = function ({onBuild}, $) {
    $.cli.log("[HELLO] I was called")
    onBuild("index.js", async ({renderPage}) => {
            renderPage("/index", {emoji: "🔥"})
        }
    )
    onBuild("about.js", async ({renderPage}) => {
            renderPage("/hola", {emoji: "🔥"})
        }
    )
}