"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalPlugMinVer = void 0;
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
    postExport() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = default_1;
