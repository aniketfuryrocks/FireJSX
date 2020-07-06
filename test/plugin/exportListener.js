const GlobalPlugin = require("../../dist/plugins/GlobalPlugin.js");

exports.default = class extends GlobalPlugin.default {
    constructor(config) {
        super();
        console.log(config)
    }

    async init(args) {
        console.log({args})
        return new Promise(res => void
            setTimeout(() => {
                console.log("20s passed")
                res();
            }, 20000)
        )
    }

    async postExport() {
        console.log("Export complete")
    }
}