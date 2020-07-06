const PagePlugin = require("../../dist/plugins/PagePlugin.js");

exports.default = class extends PagePlugin.default {
    constructor() {
        super("index.js");
    }

    async onBuild({renderPage}, info, ...extra) {
        renderPage("/index", {emoji: "🔥"})
    }
}