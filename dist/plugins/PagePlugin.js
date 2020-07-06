"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireJSXPlugin_1 = require("./FireJSXPlugin");
exports.PagePlugMinVer = 2.0;
class default_1 extends FireJSXPlugin_1.default {
    constructor(page) {
        super(2.0, FireJSXPlugin_1.PluginCode.PagePlugin);
        this.page = page;
    }
    async onBuild(actions, info, ...extra) {
        // @ts-ignore
        actions.renderPage("/" + this.page.toString().substring(0, this.page.toString().lastIndexOf(".")));
    }
    onRender(dom) {
    }
}
exports.default = default_1;
