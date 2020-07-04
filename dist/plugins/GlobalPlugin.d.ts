/// <reference types="express-serve-static-core" />
import FireJSXPlugin from "./FireJSXPlugin";
import { JSDOM } from "jsdom";
export declare const GlobalPlugMinVer = 1;
export default class extends FireJSXPlugin {
    protected constructor();
    initServer(server: Express.Application): void;
    initDom(dom: JSDOM): void;
}
