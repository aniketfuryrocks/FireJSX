import {join} from "path"

export default function (source, map) {
    //if current file is not in the pages directory
    //then do nothing
    if (!this.resourcePath.startsWith(this.query.pages_path))
        return void this.callback(null, source, map)
    //import Wrap.js and pass app
    source +=
        `import t from "${join(__dirname, "../web/Wrap.js")}";` +
        `try{t(App)}catch(t){throw new Error("FireJSX Page export not found. Make sure to export function as \\n export default function App(){\\n//...code here\\n}")}`;
    this.callback(null, source, map)
}
