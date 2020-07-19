const {join} = require("path");

exports.default = ({initWebpack}, {config: {pro, paths: {root}}}) => {
    if (pro)
        initWebpack("*", config => {
            config.resolve.alias = join(root, "dist/HotDummy.js")
        })
}