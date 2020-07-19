import * as webpack from "webpack"
import WebpackArchitect from "./WebpackArchitect";
import {$, WebpackConfig} from "../FireJSX";
import {Compiler} from "webpack";
import {join} from "path";

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
        return new Promise<string[]>((resolve, reject) => {
            this.build(this.webpackArchitect.forExternals(), stat => {
                const externals = [];
                //external Full,external Semi, Renderer
                stat.compilation.chunks.forEach(chunk => {
                    externals.push(...chunk.files)
                })
                resolve(externals)
            }, reject)
        })
    }

    buildPages(resolve: () => void, reject: (err: any | undefined) => void) {
        // ./src/pages
        const pageRel = `.${this.$.pages.replace(process.cwd(), "")}/`
        this.build(this.webpackArchitect.forPages(), stat => {
            const statJSON = stat.toJson()
            if (this.logStat(statJSON))//true if errors
                reject(undefined);
            else {
                //log stats when verbose
                if (this.$.verbose)
                    this.$.outputFileSystem.writeFileSync(join(this.$.outDir, "stat.json"), JSON.stringify(statJSON))
                this.$.pageMap.forEach(page => {
                    page.chunks = {
                        async: [],
                        entry: [],
                        initial: []
                    }
                })
                statJSON.chunks.forEach(({files, entry, initial, origins}) => {
                    origins.forEach(({loc, moduleName}) => {
                        let page = this.$.pageMap.get(loc)
                        if (!page)
                            page = this.$.pageMap.get(moduleName.replace(pageRel, ""))
                        if (entry)//entry
                            page.chunks.entry.push(...files)
                        else if (initial) {//sync
                            page.chunks.initial.push(...files)
                        } else//async
                            page.chunks.async.push(...files)
                    })
                })
                resolve()
            }
        }, reject);
    }

    build(config: WebpackConfig, resolve: (stat) => void, reject: (err) => void) {
        this.compiler = webpack(config);
        if (this.isOutputCustom)
            this.compiler.outputFileSystem = this.$.outputFileSystem;
        if (this.isInputCustom)
            this.compiler.inputFileSystem = this.$.inputFileSystem;
        if (config.watch)
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