import {join} from "path"

export default function (source, map) {
    //if current file is not in the pages directory
    //then do nothing
    if (!this.resourcePath.startsWith(this.query.pages_path))
        return void this.callback(null, source, map)
    //import Wrap.js and pass app
    source += `require("${join(__dirname, "../web/Wrap.js")}").default(module.exports);`;
    console.log(source)
    this.callback(null, source, map)
}
