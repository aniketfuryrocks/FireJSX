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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const jsdom_1 = require("jsdom");
const Require_1 = require("../utils/Require");
const react_helmet_1 = require("react-helmet");
class default_1 {
    constructor(param) {
        this.config = param;
        //global.window circular
        // @ts-ignore
        global.window = global;
        global.FireJSX = {
            isSSR: param.ssr,
            libRel: this.config.rel.libRel,
            mapRel: this.config.rel.mapRel
        };
        //init JSDOM
        this.config.template = new jsdom_1.JSDOM(param.template);
        //init template
        {
            const script = this.config.template.window.document.createElement("script");
            script.innerHTML =
                `window.FireJSX={` +
                    `libRel:"${this.config.rel.libRel}",` +
                    `mapRel:"${this.config.rel.mapRel}",` +
                    `pages:{404:"/${this.config.explicitPages["404"].substring(0, this.config.explicitPages["404"].lastIndexOf("."))}"}` +
                    `${param.ssr ? `,isHydrated:true` : ""}` +
                    "}";
            this.config.template.window.document.head.appendChild(script);
        }
        {
            const meta = this.config.template.window.document.createElement("meta");
            meta.content = `FireJSX v${global.__FIREJSX_VERSION__}`;
            meta.name = "generator";
            this.config.template.window.document.head.appendChild(meta);
        }
        //require uncached to prevent bugs in lambda because node clears these 2 when a new request is assigned
        //if ssr then load react,react dom,LinkApi,ReactDOMServer chunks
        if (param.ssr)
            Require_1.requireUncached(path_1.join(this.config.pathToLib, this.config.externals[0]));
        else //just load LinkApi
            Require_1.requireUncached("../web/LinkApi");
    }
    renderGlobalPlugin(globalPlugin) {
        globalPlugin.initDom(this.config.template);
    }
    render(page, path, content) {
        return new Promise(resolve => {
            //webpack global variable reset
            global.window.webpackJsonp = undefined;
            //template serialize to prevent overwriting
            const dom = new jsdom_1.JSDOM(this.config.template.serialize(), {
                url: "https://localhost:5000" + path,
            });
            //load stuff from dom.window to global
            for (const domKey of ["document", "location", "history", "navigator", "screen", "matchMedia", "getComputedStyle"])
                global[domKey] = dom.window[domKey];
            //globals
            global.FireJSX.map = {
                content,
                chunks: page.chunks
            };
            //isSSR
            global.FireJSX.isSSR = this.config.ssr;
            //reset lazy count
            global.FireJSX.lazyPromises = [];
            //chunks
            {
                let index;
                //css
                for (index = 1; index < page.chunks.length; index++) {
                    if (!page.chunks[index].endsWith(".js")) {
                        const cssLink = document.createElement("link");
                        cssLink.href = `/${this.config.rel.libRel}/${page.chunks[index]}`;
                        cssLink.rel = "stylesheet";
                        cssLink.crossOrigin = "anonymous";
                        document.head.prepend(cssLink);
                    }
                    else
                        break;
                }
                //map preload and load
                {
                    const link = document.createElement("link");
                    const script = document.createElement("script");
                    script.src = link.href = global.FireJSX.linkApi.getMapUrl(path);
                    link.rel = "preload";
                    script.crossOrigin = link.crossOrigin = "anonymous";
                    link.setAttribute("as", "script");
                    document.head.appendChild(link);
                    document.body.appendChild(script);
                }
                //React
                global.FireJSX.linkApi.preloadChunks([this.config.externals[1]]);
                global.FireJSX.linkApi.loadChunks([this.config.externals[1]]);
                //Main Chunk
                global.FireJSX.linkApi.preloadChunks([page.chunks[0]]);
                global.FireJSX.linkApi.loadChunks([page.chunks[0]]);
                if (this.config.ssr)
                    Require_1.requireUncached(path_1.join(this.config.pathToLib, page.chunks[0]));
                //Render Chunk
                global.FireJSX.linkApi.preloadChunks([this.config.externals[2]]);
                global.FireJSX.linkApi.loadChunks([this.config.externals[2]]);
                //add rest of the chunks
                for (; index < page.chunks.length; index++) {
                    global.FireJSX.linkApi.preloadChunks([page.chunks[index]]);
                    global.FireJSX.linkApi.loadChunks([page.chunks[index]]);
                    if (this.config.ssr)
                        Require_1.requireUncached(path_1.join(this.config.pathToLib, page.chunks[index]));
                }
            }
            //static render
            if (this.config.ssr) {
                document.getElementById("root").innerHTML = global.window.ReactDOMServer.renderToString(global.React.createElement(global.FireJSX.app, { content: global.FireJSX.map.content }));
            }
            //resolve all promises
            (() => __awaiter(this, void 0, void 0, function* () {
                var e_1, _a;
                try {
                    for (var _b = __asyncValues(global.FireJSX.lazyPromises), _c; _c = yield _b.next(), !_c.done;) {
                        const lazyPromise = _c.value;
                        yield lazyPromise();
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (this.config.ssr) {
                    const helmet = react_helmet_1.Helmet.renderStatic();
                    for (let helmetKey in helmet)
                        document.head.innerHTML += helmet[helmetKey].toString();
                }
                page.plugin.onRender(dom); //call plugin
                resolve(dom.serialize()); //serialize i.e get html
            }))();
        });
    }
}
exports.default = default_1;
