// Adds ReactRefreshRuntime to window
export default function (source, map) {
    //if current file is not externalGroupSemi then do nothing
    if (this.resourcePath !== this.query.externalSemiPath)
        return void this.callback(null, source, map)
    //import Wrap.js and pass app
    source += `window.ReactRefreshRuntime = require("react-refresh/runtime")`;
    this.callback(null, source, map)
}
