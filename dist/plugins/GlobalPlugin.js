"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireJSXPlugin_1 = require("./FireJSXPlugin");
exports.GlobalPlugMinVer = 1.0;
class default_1 extends FireJSXPlugin_1.default {
    constructor() {
        super(2.0, FireJSXPlugin_1.PluginCode.GlobalPlugin);
    }
    initServer(server) {
    }
    initDom(dom) {
    }
    async postExport() {
    }
}
exports.default = default_1;
