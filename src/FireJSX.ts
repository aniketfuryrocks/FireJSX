import "./GlobalsSetter"
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

export type WebpackConfig = Configuration;

export interface $ extends Params {
    pageMap?: Map<string, Page>,
    renderer?: StaticArchitect,
    pageArchitect?: PageArchitect,
    hooks: GlobalHooks,
}

export interface Params {
    outputFileSystem?,
    inputFileSystem?,
    args: Args,
    pro: boolean,
    verbose: boolean,
    ssr: boolean,
    cli: Cli,
    outDir: string,
    cacheDir: string,
    lib: string,
    pages: string,
    prefix: string,
    staticPrefix: string,
    plugins: string[]
}

export interface FIREJSX_MAP {
    staticConfig: StaticConfig,
    pageMap: {
        [key: string]: PageChunks
    },
}

export default class {
    private readonly $: $

    constructor(params: Params) {
        if (!params)
            throw new TypeError("expected params, found undefined")
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
        //log
        this.$.cli.ok("PRO :", this.$.pro)
        this.$.cli.ok("SSR :", this.$.ssr)
        //set env
        process.env.BABEL_ENV = process.env.NODE_ENV = params.pro ? 'production' : 'development';
        //pageMap
        this.$.pageMap = createMap(this.$.pages, this.$.inputFileSystem);
        //pageArchitect
        this.$.pageArchitect = new PageArchitect(this.$, new WebpackArchitect(this.$), !!params.outputFileSystem, !!params.inputFileSystem);
    }

    async init() {
        //build externals
        this.$.cli.log("Building Externals");
        this.$.renderer = new StaticArchitect({
            template: this.$.inputFileSystem.readFileSync(join(__dirname, "./web/template.html")).toString(),
            externals: await this.$.pageArchitect.buildExternals(),
            lib: this.$.lib,
            outDir: this.$.outDir,
            ssr: this.$.ssr,
            prefix: this.$.prefix,
            staticPrefix: this.$.staticPrefix
        });
        //mapPlugins after everything is initialized
        if (this.$.plugins.length > 0) {
            this.$.cli.log("Mapping plugins");
            await Promise.all(this.$.plugins.map(plugin => mapPlugin(plugin, this.$)))
        }
    }

    buildPages() {
        return new Promise<any>((resolve, reject) => {
            this.$.pageArchitect.buildPages(() => {
                this.$.cli.ok('Build Complete')
                this.$.pageMap.forEach(page => {
                    const renderPromises = [];
                    //if there is not hook then build the default page
                    if (page.hooks.onBuild.length === 0)
                        page.hooks.onBuild.push(async ({renderPage}) => {
                            await renderPage("/" + page.toString().substring(0, page.toString().lastIndexOf(".")))
                        })
                    //call hooks
                    Promise.all(page.hooks.onBuild.map(onBuild => onBuild({
                        renderPage: (path, content = {}) => {
                            if (!path) {
                                this.$.cli.warn(`Skipping render for page "${page.toString()}", since onBuild -> renderPage hook was called without a path`)
                                return
                            }
                            if (this.$.verbose)
                                this.$.cli.log(`Rendering Path : ${path}`);
                            //push promise
                            renderPromises.push((async () => {
                                const dom = await this.$.renderer.render(page, path, content)
                                this.$.cli.ok(`Rendered Path : ${path}`)
                                //call page postRender hooks
                                page.hooks.postRender.forEach(postRender => postRender(dom))
                                //call global postRender hooks
                                this.$.hooks.postRender.forEach(postRender => postRender(dom))
                                //await promises
                                await Promise.all([
                                    //write html file
                                    writeFileRecursively(join(this.$.outDir, `${path}.html`),
                                        dom.serialize(),
                                        this.$.outputFileSystem),
                                    //write map
                                    writeFileRecursively(join(this.$.outDir, `${this.$.lib}/map/${path}.map.js`),
                                        `FireJSX.map=${JSON.stringify({
                                            content,
                                            chunks: page.chunks
                                        })}`,
                                        this.$.outputFileSystem
                                    )
                                ])
                            })())
                        }
                    }))).then(() =>
                        Promise.all(renderPromises)
                            .then(resolve)
                            .catch(reject))
                        .catch(reject)
                })
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
                staticConfig: {
                    ...this.$.renderer.config,
                    template: this.$.inputFileSystem.readFileSync(join(__dirname, "./web/template.html")).toString(),
                    ssr: true
                },
                pageMap: {},
            }
            await this.buildPages().catch(err => {
                throw err
            })
            this.$.cli.ok("Build Complete")
            this.$.cli.ok("Removing Assets")
            this.$.pageMap.forEach(page => {
                map.pageMap[page.toString()] = page.chunks;
                //move files
                for (const chunkKey in page.chunks) {
                    //loop through each chunk type
                    page.chunks[chunkKey].forEach(chunk => {
                        //move only js
                        if (!chunk.endsWith(".js")) {
                            if (this.$.verbose)
                                this.$.cli.log(`Deleting file ${chunk}`)

                            const chunkPath = join(this.$.outDir, chunk)
                            //pages share common chunks
                            if (this.$.outputFileSystem.existsSync(chunkPath))
                                //unlink sync to prevent deleting same file twice
                                this.$.outputFileSystem.unlinkSync(chunkPath);
                        }
                    })
                }
            })

            /*const fullExternalName = map.staticConfig.externals[0].substr(map.staticConfig.externals[0].lastIndexOf("/") + 1);
            this.$.outputFileSystem.rename(join(this.$.config.paths.lib, map.staticConfig.externals[0]), join(this.$.config.paths.fly, fullExternalName), err => {
                if (err)
                    throw new Error(`Error moving ${fullExternalName} to ${this.$.config.paths.fly}\n${err}`);
                map.staticConfig.externals[0] = fullExternalName;
                this.$.outputFileSystem.writeFile(join(this.$.config.paths.fly, "firejsx.map.json"),
                    JSON.stringify(map), err => {
                        if (err)
                            reject(err)
                        else
                            resolve()
                    })
            })*/
        })
    }

    getContext(): $ {
        return this.$;
    }
}
