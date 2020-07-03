"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack = require("webpack");
class default_1 {
    constructor(globalData, webpackArchitect, isOutputCustom, isInputCustom) {
        this.$ = globalData;
        this.webpackArchitect = webpackArchitect;
        this.isOutputCustom = isOutputCustom;
        this.isInputCustom = isInputCustom;
    }
    buildExternals() {
        return new Promise((resolve, reject) => {
            this.build(this.webpackArchitect.forExternals(), stat => {
                const externals = [];
                stat.compilation.chunks.forEach(chunk => {
                    externals.push(...chunk.files);
                });
                resolve(externals);
            }, reject);
        });
    }
    buildPage(page, resolve, reject) {
        return this.build(this.webpackArchitect.forPage(page), (stat) => {
            if (this.logStat(stat)) //true if errors
                reject(undefined);
            else {
                page.chunks = []; //re-init chunks
                const css = [];
                let mainChunk;
                stat.compilation.chunks.forEach(chunk => chunk.files.forEach(file => {
                    if (file.endsWith(".css")) //prevent FOUC
                        css.push(file);
                    else if (file.startsWith("m"))
                        mainChunk = file;
                    else
                        page.chunks.push(file);
                }));
                page.chunks.unshift(mainChunk, ...css);
                resolve();
            }
        }, reject);
    }
    build(config, resolve, reject) {
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
    logStat(stat) {
        if (stat.hasWarnings()) {
            // @ts-ignore
            this.$.cli.warn(`Warning in page ${stat.compilation.name}\n`, ...stat.compilation.warnings);
        }
        if (stat.hasErrors()) {
            if (stat.compilation.errors.length === 0) {
                // @ts-ignore
                this.$.cli.error(`Error in page ${stat.compilation.name}`);
            }
            else {
                // @ts-ignore
                this.$.cli.error(`Error in page ${stat.compilation.name}\n`, ...stat.compilation.errors);
            }
            // @ts-ignore
            this.$.cli.error(`Unable to build page ${stat.compilation.name} with ${stat.compilation.errors.length} error(s)`);
            return true;
        }
    }
}
exports.default = default_1;
