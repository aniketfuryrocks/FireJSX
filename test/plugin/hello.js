exports.default = function ({onBuild}, $) {
    $.cli.log("[HELLO] I was called")
    onBuild("index.js", async ({renderPage}) => {
            console.log("on build callback")
            renderPage("/index", {emoji: "🔥"})
        }
    )
}