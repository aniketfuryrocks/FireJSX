"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PagePlugin_1 = require("../plugins/PagePlugin");
class default_1 {
    constructor(page) {
        this.chunks = [];
        this.name = page;
        // @ts-ignore
        this.plugin = new PagePlugin_1.default(this.name);
    }
    toString() {
        return this.name;
    }
}
exports.default = default_1;
