const GlobalPlugin = require("../../dist/plugins/GlobalPlugin.js");

exports.default = class extends GlobalPlugin.default {
    constructor() {
        super();
    }

    async postExport() {
        console.log("Export complete")
    }
}