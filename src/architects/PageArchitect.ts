import * as webpack from "webpack"
import WebpackArchitect from "./WebpackArchitect";
import {$, WebpackConfig, WebpackStat} from "../FireJSX";
import Page from "../classes/Page";
import {Compiler} from "webpack";
import {join} from "path";

export default class {
    private readonly $: $;
    public readonly webpackArchitect: WebpackArchitect
    public isOutputCustom: boolean
    public isInputCustom: boolean

    constructor(globalData: $, webpackArchitect, isOutputCustom: boolean, isInputCustom: boolean) {
        this.$ = globalData;
        this.webpackArchitect = webpackArchitect;
        this.isOutputCustom = isOutputCustom;
        this.isInputCustom = isInputCustom;
    }


    buildPages(pages: Page[], resolve: () => void, reject: (err: any | undefined) => void): Compiler {
        return this.build(this.webpackArchitect.forPages(pages), (stat) => {
            if (this.logStat(stat))//true if errors
                reject(undefined);
            else {
                this.$.outputFileSystem.writeFileSync(join(this.$.config.paths.cache, "hello.json"), JSON.stringify(stat.toJson()))
                stat.toJson().forEach(({files, entry, initial, origins}) => {
                    origins.forEach(({loc, moduleName}) => {
                        let page = this.$.pageMap.get(loc)
                        if (!page)
                            page = this.$.pageMap.get(moduleName.replace("./src/pages/", ""))
                        if (entry)//entry
                            page.chunks.entry.push(...files)
                        else if (initial)//sync
                            page.chunks.initial.push(...files)
                        else//async
                            page.chunks.async.push(...files)
                    })
                })
            }
        }, reject);
    }

    build(config: WebpackConfig, resolve: (stat) => void, reject: (err) => void): Compiler {
        const compiler = webpack(config);
        if (this.isOutputCustom)
            compiler.outputFileSystem = this.$.outputFileSystem;
        if (this.isInputCustom)
            compiler.inputFileSystem = this.$.inputFileSystem;
        if (config.watch)
            compiler.watch(config.watchOptions, (err, stat) => {
                if (err)
                    reject(err);
                else
                    resolve(stat);
            });
        else
            compiler.run((err, stat) => {
                if (err)
                    reject(err);
                else
                    resolve(stat);
            });
        return compiler;
    }

    logStat(stat: WebpackStat) {
        if (stat.hasWarnings()) {
            // @ts-ignore
            this.$.cli.warn(`Warning in page ${stat.compilation.name}\n`, ...stat.compilation.warnings);
        }
        if (stat.hasErrors()) {
            if (stat.compilation.errors.length === 0) {
                // @ts-ignore
                this.$.cli.error(`Error in page ${stat.compilation.name}`)
            } else {
                // @ts-ignore
                this.$.cli.error(`Error in page ${stat.compilation.name}\n`, ...stat.compilation.errors);
            }
            // @ts-ignore
            this.$.cli.error(`Unable to build page ${stat.compilation.name} with ${stat.compilation.errors.length} error(s)`)
            return true;
        }
    }

}