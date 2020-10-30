import Cli from "./utils/Cli";
import Page from "./classes/Page";
import {Configuration} from "webpack";
import {join} from "path";
import {mapPlugin} from "./mappers/PluginMapper";
import PageArchitect from "./architects/PageArchitect";
import {writeFileRecursively} from "./utils/Fs";
import {mkdirp} from "fs-extra"
import * as fs from "fs"
import StaticArchitect, {StaticConfig} from "./architects/StaticArchitect";
import {createMap} from "./mappers/PathMapper";
import WebpackArchitect from "./architects/WebpackArchitect";
import {GlobalHooks} from "./types/Plugin";
import {Args} from "./bin/ArgsMapper";
import {PageChunks} from "./types/global";
import * as Globals from "./Globals";
import {destructGlobals} from "./Globals";
import AppPage from "./classes/AppPage";

export type WebpackConfig = Configuration;

export interface $ extends Params {
    pageMap?: Map<string, Page>,
    appPage?: AppPage
    renderer?: StaticArchitect,
    pageArchitect?: PageArchitect,
    hooks: GlobalHooks,
}

export interface Params {
    watch: boolean,
    outputFileSystem?,
    inputFileSystem?,
    args: Args,
    pro: boolean,
    verbose: boolean,
    ssr: boolean,
    cli: Cli,
    outDir: string,
    cacheDir: string,
    staticDir: string,
    lib: string,
    pages: string,
    prefix: string,
    staticPrefix: string,
    plugins: string[],
    custom: any,
    appPath: string
}

export interface FIREJSX_MAP {
    staticConfig: StaticConfig,
    pageMap: {
        [key: string]: PageChunks
    },
}

export default class {
    public readonly $: $

    constructor(params: Params) {
        if (!params)
            throw new TypeError("expected params, found undefined")
        //set globals
        Globals.initGlobals()
        // @ts-ignore
        fs.mkdirp = mkdirp;
        //set $
        this.$ = {
            ...params,
            inputFileSystem: params.inputFileSystem || fs,
            outputFileSystem: params.outputFileSystem || fs,
            hooks: {
                postRender: [],
                initServer: [],
                initWebpack: [],
                postExport: []
            }
        }
        //set env
        process.env.BABEL_ENV = process.env.NODE_ENV = params.pro ? 'production' : 'development';
        //pageMap
        this.$.pageMap = createMap(this.$.pages, this.$.inputFileSystem);
        //app Page
        this.$.appPage = new AppPage()
        //pageArchitect
        this.$.pageArchitect = new PageArchitect(this.$, new WebpackArchitect(this.$), !!params.outputFileSystem, !!params.inputFileSystem);
        //check 404.jsx
        if (!this.$.pageMap.has("404.jsx"))
            this.$.cli.warn("404.jsx page not found. Link fallback will be unsuccessful")
    }

    async init() {
        // Prevent multiple initialisations because pageArchitect sets this.compiler pages is valid for last build call
        if (this.$.renderer)
            throw new Error("FireJSX is already initialized");
        //build externals
        const externals = await this.$.pageArchitect.buildExternals()
        this.$.renderer = new StaticArchitect({
            externals,
            lib: this.$.lib,
            outDir: this.$.outDir,
            ssr: this.$.ssr,
            prefix: this.$.prefix,
            staticPrefix: this.$.staticPrefix,
            fullExternalPath: this.$.ssr ? join(this.$.cacheDir, externals.full) : undefined,
            appPage: this.$.appPage
        });
        //mapPlugins after everything is initialized
        if (this.$.plugins.length > 0) {
            this.$.cli.log(`Initializing ${this.$.plugins.length} plugin(s)`);
            await Promise.all(this.$.plugins.map(plugin => mapPlugin(plugin, this.$)))
        }
    }

    buildPages() {
        if (global.buildPageResolver)
            throw new Error("A build is already in progress, await it or run in a different global environment/node process.")
        return new Promise<any>((resolve, reject) => {
            this.$.pageArchitect.buildPages(global.buildPageResolver = () => {
                this.$.cli.ok("Pages Built");
                //require app when ssr
                if (this.$.ssr)
                    this.$.renderer.requireAppPage();

                const promises = [];
                this.$.pageMap.forEach(page => {
                    //if there is not hook then build the default page
                    if (page.hooks.onBuild.length === 0)
                        page.hooks.onBuild.push(async ({renderPage}) => {
                            await renderPage("/" + page.toString().substring(0, page.toString().lastIndexOf(".")))
                        })
                    //call hooks
                    page.hooks.onBuild.forEach(onBuild => promises.push(onBuild({
                        renderPage: async (path, content = {}) => {
                            if (!path) {
                                this.$.cli.warn(`Skipping render for page "${page.toString()}", since onBuild -> renderPage hook was called without a path`)
                                return
                            }
                            if (this.$.verbose)
                                this.$.cli.log(`Rendering Path : ${path}`);
                            const startTime = process.hrtime()[1]  //push promise
                            const html = this.$.renderer.render(page, path, content)
                            this.$.cli.ok(`Rendered Path ${path} in`, (process.hrtime()[1] - startTime) / 1e6, "ms")
                            //call page postRender hooks
                            page.hooks.postRender.forEach(postRender => postRender(html))
                            //call global postRender hooks
                            this.$.hooks.postRender.forEach(postRender => postRender(html))
                            //await promises
                            await Promise.all([
                                //write html file
                                writeFileRecursively(`${this.$.outDir}/${path}.html`,
                                    html,
                                    this.$.outputFileSystem),
                                //write map
                                (() => {
                                    const li = path.lastIndexOf("/index")
                                    const _path = li <= 0 ? path : path.substring(0, li)
                                    return writeFileRecursively(`${this.$.outDir}/${this.$.lib}/map${_path}.map.js`,
                                        generateMapJS(path, content, page),
                                        this.$.outputFileSystem
                                    )
                                })()
                            ])
                        }
                    })))
                })
                Promise.all(promises).then(() => {
                    //when watch is on, resolver never finishes.
                    if (!this.$.watch) {
                        global.buildPageResolver = undefined;
                        resolve()
                    }
                }).catch(reject)
            }, reject)
        })
    }

    async export() {
        await this.buildPages()
        if (this.$.verbose)
            this.$.cli.ok("Calling postExport Hooks")
        //call postExport Hooks
        await Promise.all(this.$.hooks.postExport.map(postExport => postExport()))
    }

    exportFly() {
        return new Promise(async (resolve, reject) => {
            const map: FIREJSX_MAP = {
                staticConfig: this.$.renderer.config,
                pageMap: {},
            }
            await this.$.pageArchitect.buildPages(() => {
                this.$.cli.ok("Build Complete")
                this.$.cli.ok("Removing Assets")

                const filterChunk = (chunk: string) => {
                    if (!chunk.endsWith(".js")) {
                        const chunkPath = join(this.$.outDir, this.$.lib, chunk)
                        //pages share common chunks
                        if (this.$.outputFileSystem.existsSync(chunkPath)) {
                            if (this.$.verbose)
                                this.$.cli.log(`Deleting file ${chunk}`)
                            //unlink sync to prevent deleting same file twice
                            this.$.outputFileSystem.unlinkSync(chunkPath);
                        }
                    }
                }

                //set chunks and filter files
                this.$.pageMap.forEach(page => {
                    map.pageMap[page.toString()] = page.chunks;
                    page.chunks.initial.forEach(filterChunk)
                    page.chunks.async.forEach(filterChunk)
                })
                //filter out chunks from app
                this.$.appPage.chunks.initial.forEach(filterChunk)
                this.$.appPage.chunks.async.forEach(filterChunk)

                const writeFlyMap = () => {
                    this.$.outputFileSystem.writeFile(join(this.$.outDir, "firejsx.map.json"), JSON.stringify(map), err => {
                        err ? reject(err) : resolve()
                    })
                }

                if (this.$.ssr)
                    this.$.outputFileSystem.rename(this.$.renderer.config.fullExternalPath, join(this.$.outDir, map.staticConfig.externals.full), err => {
                        if (err)
                            throw new Error(`Error moving ${map.staticConfig.externals.full} to ${this.$.outDir}\n${err}`);
                        writeFlyMap()
                    })
                else
                    writeFlyMap()

            }, err => {
                throw err
            })
        })
    }

    destruct() {
        destructGlobals();
    }
}

export function generateMapJS(path: string, content: any, page: Page): string {
    return `FireJSX.cache["${pathToUrlPath(path)}"]=${JSON.stringify({
        content,
        chunks: {
            initial: page.chunks.initial
        }
    })}`
}

export function pathToUrlPath(path): string {
    if (path === "/index")
        return "/"
    const li = path.lastIndexOf("/index");
    return li === -1 ? path : path.substring(0, li);
}
