exports.default = function ({onBuild}) {

    const totalTemplatePages = 3;

    onBuild("template.jsx", async ({renderPage}) => {
        for (let i = 0; i < totalTemplatePages; i++) {
            await renderPage(`/template-${i}`, {index: i})
        }
    })

    onBuild("template_index.jsx", async ({renderPage}) => renderPage(`/template_index`, {total: totalTemplatePages}))
}
