exports.default = function ({onBuild, initWebpack, postRender}, $) {
    onBuild("index.jsx", ({renderPage}) => {
            renderPage("/index", {emoji: "🔥"})
        }
    )
}
