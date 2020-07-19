const {join} = require("path");

exports.default = ({initWebpack}, {config: {pro}}) => {
    if (pro)
        initWebpack("*", config => {
            config.resolve.alias = {'firejsx/Hot': join(__dirname, "../../src/components/Hot.js")}
        })
}