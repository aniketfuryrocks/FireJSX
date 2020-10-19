import {join} from "path"

export default function (source, map) {
    //if current file is not in the pages directory then do nothing
    if (!this.resourcePath.startsWith(this.query.pages_path))
        return void this.callback(null, source, map)
    //import Wrap.js and pass app
    const require_wrap = `import { hot } from 'react-hot-loader/root';\nimport Wrap from "${join(__dirname, "../web/Wrap.js")}";\n`;
    if (!this.query.proOrSSR) {
        source = source.replace("export default", "Wrap(")
        const functionEnd = source.lastIndexOf("}");
        source = source.substring(0, functionEnd + 1) + ",hot)" + source.substring(functionEnd + 1)
        source = require_wrap + source;
    } else
        source += `${require_wrap}(module.exports.default)`;
    console.log(source)
    this.callback(null, source, map)
}
