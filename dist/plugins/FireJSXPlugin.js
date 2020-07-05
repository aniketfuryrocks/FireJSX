"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginCode = void 0;
var PluginCode;
(function (PluginCode) {
    PluginCode[PluginCode["GlobalPlugin"] = 1] = "GlobalPlugin";
    PluginCode[PluginCode["PagePlugin"] = 2] = "PagePlugin";
})(PluginCode = exports.PluginCode || (exports.PluginCode = {}));
class FireJSXPlugin {
    constructor(version, plugCode) {
        this.plugCode = plugCode;
        this.version = version;
    }
    initWebpack(webpackConfig) {
    }
}
exports.default = FireJSXPlugin;
