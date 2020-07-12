const GlobalPlugin = require("../../dist/plugins/GlobalPlugin.js");

exports.default = class extends GlobalPlugin.default {
    constructor() {
        super();
    }

    async init({_}) {
        return new Promise(res => void
            setTimeout(() => {
                console.log("20s passed")
                res();
            }, _.includes('--wait') ? 20000 : 0)
        )
    }

    async postExport() {
        console.log("Export complete")
    }
}