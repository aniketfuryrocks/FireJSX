const GlobalPlugin = require("../../dist/plugins/GlobalPlugin.js");

exports.default = class extends GlobalPlugin.default {
    constructor(config) {
        super();
        console.log(config)
    }

    async postExport() {
        console.log("Export complete")
    }
}