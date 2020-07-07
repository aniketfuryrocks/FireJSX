import "./GlobalsSetter"
import ConfigMapper, {Config} from "./mappers/ConfigMapper";
import Cli from "./utils/Cli";
import Page from "./classes/Page";
import {Configuration, Stats} from "webpack";
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
export type WebpackStat = Stats;

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
        [key: string]: string[]
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
        process.env.NODE_ENV = params.config.pro ? 'production' : 'development';
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
        //pageMap
        this.$.pageMap = createMap(this.$.config.paths.pages, this.$.inputFileSystem);
        //rel
        this.$.rel = {
            libRel: relative(this.$.config.paths.dist, this.$.config.paths.lib),
            mapRel: relative(this.$.config.paths.dist, this.$.config.paths.map)
        }
        //pageArchitect
        this.$.pageArchitect = new PageArchitect(this.$, new WebpackArchitect(this.$), !!params.outputFileSystem, !!params.inputFileSystem);
    }

    async init() {
        //Verbose
        if (this.$.config.verbose)
            this.$.cli.log(`${this.$.config.plugins.length} Plugin(s) :  ${this.$.config.plugins}`)
        //build externals
        this.$.cli.log("Building Externals");
        this.$.renderer = new StaticArchitect({
            rel: this.$.rel,
            pathToLib: this.$.config.paths.lib,
            externals: await this.$.pageArchitect.buildExternals(),
            explicitPages: this.$.config.pages,
            template: this.$.inputFileSystem.readFileSync(join(__dirname, "./web/template.html")).toString(),
            ssr: this.$.config.ssr,
        });
        //mapPlugins after everything is initialized
        if (this.$.config.plugins.length > 0) {
            this.$.cli.log("Mapping plugins");
            for await (const plugin of this.$.config.plugins)
                await mapPlugin(plugin, this.$)
        }
    }

    buildPage(page: Page, setCompiler: (Compiler) => void = () => {
    }) {
        return new Promise<any>((resolve, reject) => {
            setCompiler(this.$.pageArchitect.buildPage(page, () => {
                if (this.$.config.verbose)
                    this.$.cli.ok(`Page : ${page.toString()}`)
                const renderPromises = [];
                //if there is not hook then build the default page
                if (page.hooks.onBuild.length === 0)
                    page.hooks.onBuild.push(async ({renderPage}) => {
                        await renderPage("/" + page.toString().substring(0, page.toString().lastIndexOf(".")))
                    })
                Promise.all(page.hooks.onBuild.map(onBuild => onBuild({
                    renderPage: (path, content = {}) => {
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
                            //write html file
                            await writeFileRecursively(join(this.$.config.paths.dist, `${path}.html`),
                                dom.serialize(),
                                this.$.outputFileSystem)
                            //write map
                            await writeFileRecursively(join(this.$.config.paths.map, `${path}.map.js`),
                                `FireJSX.map=${JSON.stringify({
                                    content,
                                    chunks: page.chunks
                                })}`,
                                this.$.outputFileSystem
                            )
                        })())
                    }
                }))).then(() =>
                    Promise.all(renderPromises)
                        .then(resolve)
                        .catch(reject))
                    .catch(reject)
            }, reject))
        })
    }

    async export() {
        const promises = [];
        this.$.pageMap.forEach((page) =>
            promises.push(this.buildPage(page, undefined))
        )
        //wait for all export promises to resolve
        await Promise.all(promises)
        //call postExport Hooks
        await Promise.all(this.$.hooks.postExport.map(postExport => postExport()))
    }

    exportFly() {
        return new Promise((resolve) => {
            const map: FIREJSX_MAP = {
                staticConfig: {
                    ...this.$.renderer.config,
                    template: this.$.inputFileSystem.readFileSync(join(__dirname, "./web/template.html")).toString(),
                    ssr: true
                },
                pageMap: {},
            }
            const promises = [];
            for (const page of this.$.pageMap.values()) {
                promises.push(new Promise(resolve =>
                    this.$.pageArchitect.buildPage(page, () => {
                        this.$.cli.ok(`Page : ${page.toString()}`)
                        map.pageMap[page.toString()] = page.chunks;
                        page.chunks.forEach(chunk => {
                            if (chunk.endsWith(".js")) {
                                const chunkPath = join(this.$.config.paths.lib, chunk);
                                this.$.outputFileSystem.copyFile(chunkPath, join(this.$.config.paths.fly, chunk), err => {
                                    resolve();
                                    if (err)
                                        throw new Error(`Error moving ${chunkPath} to ${this.$.config.paths.fly}`);
                                });
                            }
                        })
                    }, (e) => {
                        this.$.cli.error(`Error building page ${page}\n`, e);
                        throw "";
                    })
                ))
            }
            const fullExternalName = map.staticConfig.externals[0].substr(map.staticConfig.externals[0].lastIndexOf("/") + 1);
            this.$.outputFileSystem.rename(join(this.$.config.paths.lib, map.staticConfig.externals[0]), join(this.$.config.paths.fly, fullExternalName), err => {
                if (err)
                    throw new Error(`Error moving ${fullExternalName} to ${this.$.config.paths.fly}`);
                map.staticConfig.externals[0] = fullExternalName;
                Promise.all(promises).then(() =>
                    this.$.outputFileSystem.writeFile(join(this.$.config.paths.fly, "firejsx.map.json"),
                        JSON.stringify(map), resolve))
            })
        })
    }

    getContext(): $ {
        return this.$;
    }
}
