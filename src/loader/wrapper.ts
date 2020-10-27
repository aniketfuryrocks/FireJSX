import {join} from "path"

export default function (source, map) {
    //if current file is not in the pages directory then do nothing
    if (!this.resourcePath.startsWith(this.query.pages_path))
        return void this.callback(null, source, map)
    //Wrap default export function in Wrap,pass hot in development
    source = source.replace("export default ", `require("${join(__dirname, "../web/Wrap")}").default(`)
    const functionEnd = source.lastIndexOf("}");
    source = source.substring(0, functionEnd + 1) + (
            this.query.proOrSSR ? `)` : `,require("react-hot-loader/root").hot)`) +
        source.substring(functionEnd + 1);
    //callback with new src
    this.callback(null, source, map)
}
