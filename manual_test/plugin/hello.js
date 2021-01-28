exports.default = function ({onBuild}) {
    onBuild("index.jsx", ({renderPage}) => renderPage("/index", {emoji: "🔥"}))
}
