"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathToUrlPath = exports.generateMapJS = void 0;
const path_1 = require("path");
const PluginMapper_1 = require("./mappers/PluginMapper");
const PageArchitect_1 = require("./architects/PageArchitect");
const Fs_1 = require("./utils/Fs");
const fs_extra_1 = require("fs-extra");
const fs = require("fs");
const StaticArchitect_1 = require("./architects/StaticArchitect");
const PathMapper_1 = require("./mappers/PathMapper");
const WebpackArchitect_1 = require("./architects/WebpackArchitect");
const Globals = require("./Globals");
const Globals_1 = require("./Globals");
const AppPage_1 = require("./classes/AppPage");
const LinkTools_1 = require("./utils/LinkTools");
class default_1 {
    constructor(params) {
        if (!params)
            throw new TypeError("expected params, found undefined");
        //set globals
        Globals.initGlobals();
        // @ts-ignore
        fs.mkdirp = fs_extra_1.mkdirp;
        //set $
        this.$ = Object.assign(Object.assign({}, params), { inputFileSystem: params.inputFileSystem || fs, outputFileSystem: params.outputFileSystem || fs, hooks: {
                postRender: [],
                initServer: [],
                initWebpack: [],
                postExport: []
            } });
        //set env
        process.env.BABEL_ENV = process.env.NODE_ENV = params.pro ? 'production' : 'development';
        //pageMap
        this.$.pageMap = PathMapper_1.createMap(this.$.pages, this.$.inputFileSystem);
        //app Page
        this.$.appPage = new AppPage_1.default();
        //pageArchitect
        this.$.pageArchitect = new PageArchitect_1.default(this.$, new WebpackArchitect_1.default(this.$), !!params.outputFileSystem, !!params.inputFileSystem);
        //check 404.jsx
        if (!this.$.pageMap.has("404.jsx"))
            this.$.cli.warn("404.jsx page not found. Link fallback will be unsuccessful");
    }
    async init() {
        // Prevent multiple initialisations because pageArchitect sets this.compiler pages is valid for last build call
        if (this.$.renderer)
            throw new Error("FireJSX is already initialized");
        //build externals
        const externals = await this.$.pageArchitect.buildExternals();
        this.$.renderer = new StaticArchitect_1.default({
            externals,
            lib: this.$.lib,
            outDir: this.$.outDir,
            ssr: this.$.ssr,
            prefix: this.$.prefix,
            staticPrefix: this.$.staticPrefix,
            fullExternalPath: this.$.ssr ? path_1.join(this.$.cacheDir, externals.full) : undefined,
            appPage: this.$.appPage
        });
        //mapPlugins after everything is initialized
        if (this.$.plugins.length > 0) {
            this.$.cli.log(`Initializing ${this.$.plugins.length} plugin(s)`);
            await Promise.all(this.$.plugins.map(plugin => PluginMapper_1.mapPlugin(plugin, this.$)));
        }
    }
    buildPages() {
        if (global.buildPageResolver)
            throw new Error("A build is already in progress, await it or run in a different global environment/node process.");
        return new Promise((resolve, reject) => {
            this.$.pageArchitect.buildPages(global.buildPageResolver = () => {
                this.$.cli.ok("Pages Built");
                //require app when ssr
                if (this.$.ssr)
                    this.$.renderer.requireAppPage();
                const promises = [];
                this.$.pageMap.forEach(page => {
                    //if there is not hook then build the default page
                    if (page.hooks.onBuild.length === 0)
                        page.hooks.onBuild.push(async ({ renderPage }) => {
                            await renderPage("/" + page.toString().substring(0, page.toString().lastIndexOf(".")));
                        });
                    //call hooks
                    page.hooks.onBuild.forEach(onBuild => promises.push(onBuild({
                        renderPage: async (path, content = {}) => {
                            if (!path) {
                                this.$.cli.warn(`Skipping render for page "${page.toString()}", since onBuild -> renderPage hook was called without a path`);
                                return;
                            }
                            if (this.$.verbose)
                                this.$.cli.log(`Rendering Path : ${path}`);
                            const startTime = process.hrtime()[1]; //push promise
                            const html = this.$.renderer.render(page, path, content);
                            this.$.cli.ok(`Rendered Path ${path} in`, (process.hrtime()[1] - startTime) / 1e6, "ms");
                            //call page postRender hooks
                            page.hooks.postRender.forEach(postRender => postRender(html));
                            //call global postRender hooks
                            this.$.hooks.postRender.forEach(postRender => postRender(html));
                            //await promises
                            await Promise.all([
                                //write html file
                                Fs_1.writeFileRecursively(`${this.$.outDir}/${path}.html`, html, this.$.outputFileSystem),
                                //write map
                                (() => {
                                    const li = path.lastIndexOf("/index");
                                    const _path = li <= 0 ? path : path.substring(0, li);
                                    return Fs_1.writeFileRecursively(`${this.$.outDir}/${this.$.lib}/map${_path}.map.js`, generateMapJS(path, content, page), this.$.outputFileSystem);
                                })()
                            ]);
                        }
                    })));
                });
                Promise.all(promises).then(() => {
                    //when watch is on, resolver never finishes.
                    if (!this.$.watch) {
                        global.buildPageResolver = undefined;
                        resolve();
                    }
                }).catch(reject);
            }, reject);
        });
    }
    async export() {
        await this.buildPages();
        if (this.$.verbose)
            this.$.cli.ok("Calling postExport Hooks");
        //call postExport Hooks
        await Promise.all(this.$.hooks.postExport.map(postExport => postExport()));
    }
    exportFly() {
        return new Promise(async (resolve, reject) => {
            const map = {
                staticConfig: this.$.renderer.config,
                pageMap: {},
            };
            await this.$.pageArchitect.buildPages(() => {
                this.$.cli.ok("Build Complete");
                this.$.cli.ok("Removing Assets");
                const filterChunk = (chunk) => {
                    if (!chunk.endsWith(".js")) {
                        const chunkPath = path_1.join(this.$.outDir, this.$.lib, chunk);
                        //pages share common chunks
                        if (this.$.outputFileSystem.existsSync(chunkPath)) {
                            if (this.$.verbose)
                                this.$.cli.log(`Deleting file ${chunk}`);
                            //unlink sync to prevent deleting same file twice
                            this.$.outputFileSystem.unlinkSync(chunkPath);
                        }
                    }
                };
                //set chunks and filter files
                this.$.pageMap.forEach(page => {
                    map.pageMap[page.toString()] = page.chunks;
                    page.chunks.initial.forEach(filterChunk);
                    page.chunks.async.forEach(filterChunk);
                });
                //filter out chunks from app
                this.$.appPage.chunks.initial.forEach(filterChunk);
                this.$.appPage.chunks.async.forEach(filterChunk);
                const writeFlyMap = () => {
                    this.$.outputFileSystem.writeFile(path_1.join(this.$.outDir, "firejsx.map.json"), JSON.stringify(map), err => {
                        err ? reject(err) : resolve(void 0);
                    });
                };
                if (this.$.ssr)
                    this.$.outputFileSystem.rename(this.$.renderer.config.fullExternalPath, path_1.join(this.$.outDir, map.staticConfig.externals.full), err => {
                        if (err)
                            throw new Error(`Error moving ${map.staticConfig.externals.full} to ${this.$.outDir}\n${err}`);
                        writeFlyMap();
                    });
                else
                    writeFlyMap();
            }, err => {
                throw err;
            });
        });
    }
    destruct() {
        Globals_1.destructGlobals();
    }
}
exports.default = default_1;
function generateMapJS(path, content, page) {
    return `!function(){const e="${page.toString()}";FireJSX.pathsCache["${LinkTools_1.rmIndexSuffixFromPath(path)}"]={page:e,content:${JSON.stringify(content)}},(FireJSX.pagesCache[e]=FireJSX.pagesCache[e]||{}).chunks=${JSON.stringify({
        initial: page.chunks.initial
    })}}();`;
}
exports.generateMapJS = generateMapJS;
function pathToUrlPath(path) {
    if (path === "/index")
        return "/";
    const li = path.lastIndexOf("/index");
    return li === -1 ? path : path.substring(0, li);
}
exports.pathToUrlPath = pathToUrlPath;
