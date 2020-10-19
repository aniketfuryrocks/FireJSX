import {join} from "path"

export default function (source, map) {
    //if current file is not in the pages directory then do nothing
    if (!this.resourcePath.startsWith(this.query.pages_path))
        return void this.callback(null, source, map)
    //import Wrap.js and pass app
    const require_wrap = `require("${join(__dirname, "../web/Wrap.js")}").default(module.exports.default`;
    source += this.query.proOrSSR ? `${require_wrap});` : `import { hot } from 'react-hot-loader/root'; ${require_wrap},hot);`;
    this.callback(null, source, map)
}
