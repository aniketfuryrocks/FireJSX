import "./GlobalsSetter"
import ConfigMapper, {Config} from "./mappers/ConfigMapper";
import Cli from "./utils/Cli";
import Page from "./classes/Page";
import {Configuration} from "webpack";
import {join, relative} from "path";
import {mapPlugin} from "./mappers/PluginMapper";
import PageArchitect from "./architects/PageArchitect";
import {writeFileRecursively} from "./utils/Fs";
import {mkdirp} from "fs-extra"
import * as fs from "fs"
import StaticArchitect, {StaticConfig} from "./architects/StaticArchitect";
import {createMap} from "./mappers/PathMapper";
import WebpackArchitect from "./architects/WebpackArchitect";
import {GlobalHooks} from "./types/Plugin";
import {Args} from "./mappers/ArgsMapper";

export type WebpackConfig = Configuration;

export interface PathRelatives {
    libRel: string,
    mapRel: string
}

export interface $ {
    config?: Config,
    pageMap?: Map<string, Page>,
    cli?: Cli,
    rel?: PathRelatives,
    outputFileSystem?,
    inputFileSystem?,
    renderer?: StaticArchitect,
    pageArchitect?: PageArchitect,
    hooks: GlobalHooks,
    args?: Args
}

export interface Params {
    config?: Config,
    outputFileSystem?,
    inputFileSystem?,
    args?: Args
}

export interface FIREJSX_MAP {
    staticConfig: StaticConfig,
    pageMap: {
        [key: string]: PageChunks
    },
}

export default class {
    private readonly $: $ = {
        hooks: {
            postRender: [],
            initServer: [],
            initWebpack: [],
            postExport: []
        }
    };

    private constructParams(params: Params): void {
        params.config = params.config || {};
        params.config.paths = params.config.paths || {};
        params.args = params.args || {_: []}
    }

    constructor(params: Params = {}) {
        this.constructParams(params);
        process.env.BABEL_ENV = process.env.NODE_ENV = params.config.pro ? 'production' : 'development';
        // @ts-ignore
        fs.mkdirp = mkdirp;
        this.$.inputFileSystem = params.inputFileSystem || fs
        this.$.outputFileSystem = params.outputFileSystem || fs;
        //args
        this.$.args = params.args
        //config
        this.$.config = new ConfigMapper(this.$.inputFileSystem, this.$.outputFileSystem).getConfig(params.config)
        //cli
        this.$.cli = new Cli(this.$.config.logMode);
        //log
        this.$.cli.ok("NODE_ENV :", process.env.NODE_ENV)
        this.$.cli.ok("SSR :", this.$.config.ssr)
        if (this.$.config.verbose) {
            this.$.cli.log("config\n", this.$.config)
            this.$.cli.log("args\n", this.$.args)
        }
        //pageMap
        this.$.pageMap = createMap(this.$.config.paths.pages, this.$.inputFileSystem);
        //rel
        this.$.rel = {
            libRel: this.$.config.prefix + "/" + relative(this.$.config.paths.dist, this.$.config.paths.lib),
            mapRel: this.$.config.prefix + "/" + relative(this.$.config.paths.dist, this.$.config.paths.map)
        }
        //pageArchitect
        this.$.pageArchitect = new PageArchitect(this.$, new WebpackArchitect(this.$), !!params.outputFileSystem, !!params.inputFileSystem);
    }

    async init() {
        //build externals
        this.$.cli.log("Building Externals");
        this.$.renderer = new StaticArchitect({
            rel: this.$.rel,
            pathToLib: this.$.config.paths.lib,
            explicitPages: this.$.config.pages,
            template: this.$.inputFileSystem.readFileSync(join(__dirname, "./web/template.html")).toString(),
            externals: await this.$.pageArchitect.buildExternals(),
            ssr: this.$.config.ssr,
            prefix: this.$.config.prefix,
            staticPrefix: this.$.config.staticPrefix
        });
        //mapPlugins after everything is initialized
        if (this.$.config.plugins.length > 0) {
            this.$.cli.log("Mapping plugins");
            for await (const plugin of this.$.config.plugins)
                await mapPlugin(plugin, this.$)
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
                            if (this.$.config.verbose)
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
                                    writeFileRecursively(join(this.$.config.paths.dist, `${path}.html`),
                                        dom.serialize(),
                                        this.$.outputFileSystem),
                                    //write map
                                    writeFileRecursively(join(this.$.config.paths.map, `${path}.map.js`),
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
        if (this.$.config.verbose)
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
            const promises = [];
            this.$.cli.ok("Removing Assets")
            this.$.pageMap.forEach(page => {
                map.pageMap[page.toString()] = page.chunks;
                //move files
                for (const chunkKey in page.chunks) {
                    //loop through each chunk type
                    page.chunks[chunkKey].forEach(chunk => {
                        //move only js
                        if (!chunk.endsWith(".js")) {
                            if (this.$.config.verbose)
                                this.$.cli.log(`Deleting file ${chunk}`)
                            promises.push(new Promise(res => {
                                this.$.outputFileSystem.unlink(join(this.$.config.paths.lib, chunk), err => {
                                    if (err)
                                        throw err
                                    res();
                                });
                            }))
                        }
                    })
                }
            })

            const fullExternalName = map.staticConfig.externals[0].substr(map.staticConfig.externals[0].lastIndexOf("/") + 1);
            this.$.outputFileSystem.rename(join(this.$.config.paths.lib, map.staticConfig.externals[0]), join(this.$.config.paths.fly, fullExternalName), err => {
                if (err)
                    throw new Error(`Error moving ${fullExternalName} to ${this.$.config.paths.fly}\n${err}`);
                map.staticConfig.externals[0] = fullExternalName;
                this.$.outputFileSystem.writeFile(join(this.$.config.paths.fly, "firejsx.map.json"),
                    JSON.stringify(map), err => {
                        if (err)
                            throw new Error(`Error writing firejsx.map.json to ${this.$.config.paths.fly}\n${err}`);
                    })
                Promise.all(promises).then(resolve).catch(reject)
            })
        })
    }

    getContext(): $ {
        return this.$;
    }
}
