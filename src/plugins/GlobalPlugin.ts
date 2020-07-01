import FireJSXPlugin, {PluginCode} from "./FireJSXPlugin";
import {JSDOM} from "jsdom";

export const GlobalPlugMinVer = 1.0;

export default class extends FireJSXPlugin {

    protected constructor() {
        super(1.0, PluginCode.GlobalPlugin);
    }

    initServer(server: Express.Application) {
    }

    initDom(dom: JSDOM) {
    }
}