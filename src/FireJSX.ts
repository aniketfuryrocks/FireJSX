import "./GlobalsSetter"
import GlobalPlugin from "./plugins/GlobalPlugin";
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
    globalPlugins?: GlobalPlugin[]
}

export interface Params {
    config?: Config,
    outputFileSystem?,
    inputFileSystem?
}

export interface FIREJSX_MAP {
    staticConfig: StaticConfig,
    pageMap: {
        [key: string]: string[]
    },
}

export default class {
    private readonly $: $ = {globalPlugins: []};

    private constructParams(params: Params): void {
        params.config = params.config || {};
        params.config.paths = params.config.paths || {};
    }

    constructor(params: Params = {}) {
        this.constructParams(params);
        process.env.NODE_ENV = params.config.pro ? 'production' : 'development';
        // @ts-ignore
        fs.mkdirp = mkdirp;
        this.$.inputFileSystem = params.inputFileSystem || fs
        this.$.outputFileSystem = params.outputFileSystem || fs;
        //config
        this.$.config = new ConfigMapper(this.$.inputFileSystem, this.$.outputFileSystem).getConfig(params.config)
        //cli
        this.$.cli = new Cli(this.$.config.logMode);
        //log
        this.$.cli.ok(`NODE_ENV : ${process.env.NODE_ENV}`)
        this.$.cli.ok(`SSR : ${this.$.config.ssr}`)
        //pageMap
        this.$.pageMap = createMap(this.$.config.paths.pages, this.$.inputFileSystem);
        //rel
        this.$.rel = {
            libRel: relative(this.$.config.paths.dist, this.$.config.paths.lib),
            mapRel: relative(this.$.config.paths.dist, this.$.config.paths.map)
        }
        //pageArchitect
        this.$.pageArchitect = new PageArchitect(this.$, new WebpackArchitect(this.$), !!params.outputFileSystem, !!params.inputFileSystem);
        //mapPlugins
        if (this.$.config.plugins.length > 0) {
            this.$.cli.log("Mapping plugins");
            this.$.config.plugins.forEach(plugin => mapPlugin(plugin, {
                globalPlugins: this.$.globalPlugins,
                webpackArchitect: this.$.pageArchitect.webpackArchitect,
                pageMap: this.$.pageMap,
                rootPath: this.$.config.paths.root,
                config: this.$.config.custom
            }))
        }
        if (this.$.config.verbose)
            this.$.cli.log(`${this.$.config.plugins.length} Plugin(s) :  ${this.$.config.plugins}`)
    }

    async init() {
        this.$.cli.log("Building Externals");
        this.$.renderer = new StaticArchitect({
            rel: this.$.rel,
            pathToLib: this.$.config.paths.lib,
            externals: await this.$.pageArchitect.buildExternals(),
            explicitPages: this.$.config.pages,
            template: this.$.inputFileSystem.readFileSync(join(__dirname, "./web/template.html")).toString(),
            ssr: this.$.config.ssr,
        });
        this.$.globalPlugins.forEach(globalPlugin => this.$.renderer.renderGlobalPlugin(globalPlugin));
    }

    buildPage(page: Page, setCompiler: (Compiler) => void = () => {
    }, isExported = false) {
        return new Promise<any>((resolve, reject) => {
            setCompiler(this.$.pageArchitect.buildPage(page, () => {
                if (this.$.config.verbose)
                    this.$.cli.ok(`Page : ${page.toString()}`)
                //render
                try {
                    const promises = [];
                    const buildPromise = page.plugin.onBuild({
                        renderPage: (path, content = {}) => {
                            if (this.$.config.verbose)
                                this.$.cli.log(`Rendering Path : ${path}`);
                            promises.push(new Promise((res, rej) => {
                                this.$.renderer.render(page, path, content)
                                    .then(html => {
                                        this.$.cli.ok(`Rendered Path : ${path}`)
                                        writeFileRecursively(join(this.$.config.paths.dist, `${path}.html`),
                                            html,
                                            this.$.outputFileSystem)
                                            .then(() =>
                                                writeFileRecursively(join(this.$.config.paths.map, `${path}.map.js`),
                                                    `FireJSX.map=${JSON.stringify({
                                                        content,
                                                        chunks: page.chunks
                                                    })}`,
                                                    this.$.outputFileSystem
                                                ).then(res)).catch(e => {
                                            this.$.cli.error(`Error writing map ${path}`)
                                            rej(e)
                                        })
                                            .catch(e => {
                                                this.$.cli.error(`Error writing html ${path}`)
                                                rej(e)
                                            })
                                    })
                                    .catch(e => {
                                        this.$.cli.error(`Error rendering path ${path}`)
                                        rej(e)
                                    })
                            }))
                        }
                    }, {
                        isExported,
                        isPro: this.$.config.pro,
                        isSSR: this.$.renderer.config.ssr
                    });
                    if (buildPromise instanceof Promise)
                        buildPromise
                            .then(() => Promise.all(promises).then(resolve).catch(reject))
                            .catch(reject);
                    else
                        reject(new TypeError(`Expected async onBuild() plugin function for page ${page.toString()}`))
                    //resolve after awaiting
                } catch (e) {
                    this.$.cli.error(`Error while calling onBuild() of pagePlugin for page ${page.toString()}\n\nFunc:`, page.plugin.onBuild.toString(), "\n\n");
                    reject(e);
                }
            }, reject))
        })
    }

    export() {
        const promises = [];
        this.$.pageMap.forEach((page) =>
            promises.push(this.buildPage(page, undefined, true))
        )
        return new Promise((res, rej) => {
            //wait for all exports to finish
            Promise.all(promises).then(() => {
                //call postExport functions
                Promise.all(this.$.globalPlugins.map(plug => plug.postExport()))
                    .then(res)
                    .catch(rej)
            }).catch(rej)
        })
    }

    exportFly() {
        return new Promise((resolve) => {
            const map: FIREJSX_MAP = {
                staticConfig: {
                    ...this.$.renderer.config,
                    template: this.$.inputFileSystem.readFileSync(join(__dirname, "./web/template.html")).toString()
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
