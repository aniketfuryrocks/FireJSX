"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class default_1 {
    constructor(page) {
        this.name = page;
        this.hooks = {
            postRender: [],
            onBuild: []
        };
        this.chunks = {
            initial: [],
            async: []
        };
    }
    toString() {
        return this.name;
    }
}
exports.default = default_1;
