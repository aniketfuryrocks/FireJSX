exports.default = function ({onBuild, initWebpack, postRender}, $) {
    $.cli.log("[HELLO] I was called")
    console.log($.args)
    onBuild("index.js", ({renderPage}) => {
            renderPage("/index", {emoji: "🔥"})
        }
    )
    onBuild("about.js", ({renderPage}) => {
            renderPage("/hola")
            renderPage("/about")
        }
    )
    postRender("index.js", ({window: {document}}) => {
        console.log(document.getElementById("root"))
    })
}