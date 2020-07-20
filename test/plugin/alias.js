const {join} = require("path");

exports.default = ({initWebpack}, $) => {
    if ($.pageArchitect.webpackArchitect.proOrSSR)
        initWebpack(config =>
            config.resolve.alias = {'firejsx/Hot': join(__dirname, "../../src/components/Hot.js")}
        )
}