exports.default = function ({onBuild, initWebpack}, $) {
    $.cli.log("[HELLO] I was called")
    onBuild("index.js", async ({renderPage}) => {
            renderPage("/index", {emoji: "🔥"})
        }
    )
    onBuild("about.js", async ({renderPage}) => {
            renderPage("/hola", {emoji: "🔥"})
        }
    )
    initWebpack("index.js", (webpack) => {
        console.log("asdasd",webpack)
    })
}