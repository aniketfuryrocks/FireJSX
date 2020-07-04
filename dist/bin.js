#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const FireJSX_1 = require("./FireJSX");
const server_1 = require("./server");
const path_1 = require("path");
const ArgsMapper_1 = require("./mappers/ArgsMapper");
const ConfigMapper_1 = require("./mappers/ConfigMapper");
const MemoryFS = require("memory-fs");
function initConfig(args) {
    let userConfig = new ConfigMapper_1.default().getUserConfig(args["--conf"]);
    const customConfig = !!userConfig;
    userConfig = userConfig || {};
    userConfig.disablePlugins = args["--disable-plugins"] || userConfig.disablePlugins;
    userConfig.pro = args["--pro"] || userConfig.pro;
    userConfig.verbose = args["--verbose"] || userConfig.verbose;
    userConfig.logMode = args["--log-mode"] || userConfig.logMode;
    userConfig.paths = userConfig.paths || {};
    userConfig.paths = {
        fly: args["--fly"] || userConfig.paths.fly,
        out: args["--out"] || userConfig.paths.out,
        root: args["--root"] || userConfig.paths.root,
        cache: args["--cache"] || userConfig.paths.cache,
        dist: args["--dist"] || userConfig.paths.dist,
        map: args["--map"] || userConfig.paths.map,
        pages: args["--pages"] || userConfig.paths.pages,
        src: args["--src"] || userConfig.paths.src,
        static: args["--static"] || userConfig.paths.static,
        lib: args["--lib"] || userConfig.paths.lib,
    };
    userConfig.ssr = args["--ssr"] || userConfig.ssr;
    return [customConfig, userConfig];
}
function init() {
    const args = ArgsMapper_1.getArgs();
    //export fly
    if (args["--export-fly"]) {
        if (args["--export"])
            throw new Error("flag [-e, --export] are redundant when exporting for fly build. Rerun after removing this flag");
        if (args["--pro"])
            throw new Error("flag [-p, --pro] are redundant when exporting for fly build. Rerun after removing this flag");
        if (args["--ssr"])
            throw new Error("flag [-s, --ssr] are redundant when exporting for fly build. Rerun after removing this flag");
        args["--ssr"] = true;
        args["--pro"] = true;
    }
    //export if export-fly
    args["--export"] = args["--export-fly"] || args["--export"];
    //check if log mode is valid
    if (args["--log-mode"])
        if (args["--log-mode"] !== "silent" && args["--log-mode"] !== "plain")
            throw new Error(`unknown log mode ${args["--log-mode"]}. Expected [ silent | plain ]`);
    //init config acc to args
    const [customConfig, config] = initConfig(args);
    //config disk
    if (args["--disk"]) {
        if (args["--export"])
            throw new Error("flags [-d, --disk] are redundant when exporting");
        config.paths.dist = path_1.join(config.paths.cache || "out/.cache", "disk");
    }
    if (args["--ssr"])
        if (!(args["--disk"] || args["--export"]))
            throw new Error("flags [-s, --ssr] should be accompanied either by flags [-e,--export] or flags [-d, --disk]");
    return {
        app: args["--export"] ?
            new FireJSX_1.default({ config }) :
            new FireJSX_1.default({
                config,
                outputFileSystem: args["--disk"] ? undefined : new MemoryFS()
            }),
        args,
        customConfig
    };
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const { app, args, customConfig } = init();
        const $ = app.getContext();
        if (customConfig)
            $.cli.log("Using config from user");
        else
            $.cli.log("Using default config");
        try {
            yield app.init();
            if (args["--export-fly"]) {
                const startTime = new Date().getTime();
                $.cli.ok("Exporting for fly builds");
                yield app.exportFly();
                $.cli.ok("Finished in", (new Date().getTime() - startTime) / 1000 + "s");
                if ($.config.paths.static)
                    $.cli.warn("Don't forget to copy the static folder to dist");
            }
            else if (args["--export"]) {
                $.cli.ok("Exporting");
                const startTime = new Date().getTime();
                yield app.export();
                $.cli.ok("Finished in", (new Date().getTime() - startTime) / 1000 + "s");
                if ($.config.paths.static)
                    $.cli.warn("Don't forget to copy the static folder to dist");
            }
            else {
                const server = new server_1.default(app);
                yield server.init(args["--port"], args["--addr"]);
            }
        }
        catch (err) {
            $.cli.error(err);
        }
    });
}
let doneOnce = false;
const mainInterval = setInterval(() => {
    if (!doneOnce) {
        doneOnce = true;
        main().then(() => clearInterval(mainInterval));
    }
}, 1000);
