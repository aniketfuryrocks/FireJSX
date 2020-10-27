import * as webpack from "webpack"
import {Compiler} from "webpack"
import WebpackArchitect from "./WebpackArchitect";
import {$, WebpackConfig} from "../Api";
import {join} from "path";
import {writeFileSync} from "fs";
import {Externals} from "./StaticArchitect";

export default class {
    private readonly $: $;
    public readonly webpackArchitect: WebpackArchitect
    public isOutputCustom: boolean
    public isInputCustom: boolean
    public compiler: Compiler

    constructor(globalData: $, webpackArchitect, isOutputCustom: boolean, isInputCustom: boolean) {
        this.$ = globalData;
        this.webpackArchitect = webpackArchitect;
        this.isOutputCustom = isOutputCustom;
        this.isInputCustom = isInputCustom;
    }

    buildExternals() {
        return new Promise<Externals>((resolve, reject) => {
            const externals: Externals = {
                app: "",
                full: "",
                semi: ""
            };
            //path to app
            Promise.all([
                new Promise((resolve, reject) => {
                    this.build(this.webpackArchitect.forSemiExternal(), stat => {
                        externals.semi = stat.compilation.chunks[0].files[0];
                        resolve()
                    }, reject)
                }),
                new Promise((resolve, reject) => {
                    this.build(this.webpackArchitect.forFullExternal(), stat => {
                        externals.full = stat.compilation.chunks[0].files[0];
                        resolve()
                    }, reject)
                }),
                new Promise((resolve, reject) => {
                    this.build(this.webpackArchitect.forApp(), stat => {
                        externals.app = stat.compilation.chunks[0].files[0];
                        resolve()
                    }, reject)
                })
            ]).then(() => resolve(externals)).catch(reject)
        })
    }

    buildPages(resolve: () => void, reject: (err: any | undefined) => void) {
        const pageRel = `.${this.$.pages.replace(process.cwd(), "")}/`
        this.build(this.webpackArchitect.forPages(), stat => {
            const statJSON = stat.toJson()
            if (this.logStat(statJSON))//true if errors
                reject(undefined);
            else {
                //log stats when verbose
                if (this.$.verbose)
                    writeFileSync(join(this.$.cacheDir, "stat.json"), JSON.stringify(statJSON))

                this.$.pageMap.forEach(page => {
                    page.chunks = {
                        async: [],
                        entry: [],
                        initial: []
                    }
                })
                statJSON.chunks.forEach(({files, entry, initial, origins}) => {
                    origins.forEach(({loc, moduleName}) => {
                        let _page = this.$.pageMap.get(loc);
                        if (!_page)
                            _page = this.$.pageMap.get(moduleName.replace(pageRel, ""));
                        (_page ? [_page] : this.$.pageMap).forEach(page => {
                            if (entry)//entry
                                page.chunks.entry.push(...files)
                            else if (initial) {//sync
                                page.chunks.initial.push(...files)
                            } else//async
                                page.chunks.async.push(...files)
                        });
                    })
                })
                resolve()
            }
        }, reject);
    }

    build(config: WebpackConfig, resolve: (stat) => void, reject: (err) => void) {
        const watch = config.watch;
        delete config.watch;
        this.compiler = webpack(config);
        if (this.isOutputCustom)
            this.compiler.outputFileSystem = this.$.outputFileSystem;
        if (this.isInputCustom)
            this.compiler.inputFileSystem = this.$.inputFileSystem;
        if (watch)
            this.compiler.watch(config.watchOptions, (err, stat) => {
                if (err)
                    reject(err);
                else
                    resolve(stat);
            });
        else
            this.compiler.run((err, stat) => {
                if (err)
                    reject(err);
                else
                    resolve(stat);
            });
    }

    logStat({errors, warnings}) {
        if (warnings.length > 0) {
            this.$.cli.warn(...warnings)
            this.$.cli.warn(`${warnings.length} warning(s)`);
        }
        if (errors.length > 0) {
            this.$.cli.error(...errors)
            this.$.cli.error(`${errors.length} error(s)`);
            return true;
        }
    }

}
