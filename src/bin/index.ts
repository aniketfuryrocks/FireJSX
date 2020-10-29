#!/usr/bin/env node
import {getUserConfig, parseConfig} from "./ConfigMapper"
import {getArgs, parseArgs} from "./ArgsMapper";
import * as MemoryFS from "memory-fs";
import App from "../SSB";
import Cli from "../utils/Cli";
import Server from "../Server";

const args = parseArgs(getArgs())
const cli = new Cli(args["--log-mode"]);

(async function main() {
    const config = parseConfig((() => {
        const [path, config] = getUserConfig(args["--conf"])
        cli.ok(`Using ${path} config`)
        return config || {}
    })(), args, cli)

    if (args["--disable-plugins"])
        config.plugins = []

    const app = new App({
        outDir: config.outDir,
        cacheDir: config.cacheDir,
        prefix: config.prefix,
        pages: config.pages,
        plugins: config.plugins,
        lib: config.lib,
        custom: config.custom,
        cli,
        args,
        staticDir: config.staticDir,
        pro: !!args["--pro"],
        ssr: !!args["--ssr"],
        staticPrefix: config.staticPrefix,
        verbose: !!args["--verbose"],
        outputFileSystem: (args["--disk"] || args["--export-fly"] || args["--export"]) ? undefined : new MemoryFS(),
        appPath: config.app
    })
    // initialize
    await app.init()
    // switch according tio modes
    if (args["--export"]) {
        const startTime = new Date().getTime();
        cli.ok("Exporting");
        await app.export()
        cli.ok("Exported to", config.outDir)
        cli.ok("Finished in", (new Date().getTime() - startTime) / 1000 + "s");
        if (config.staticDir)
            cli.warn("Don't forget to copy the static folder");
    } else if (args["--export-fly"]) {
        const startTime = new Date().getTime();
        cli.ok("Exporting for on the fly rendering");
        //warn user
        if (!app.$.pro)
            cli.warn("Exporting a non-production build")
        if (!app.$.ssr)
            cli.warn("Exported build won't be able to render your app. Only a html skeleton will be produced.")
        //export
        await app.exportFly()
        cli.ok("Exported to", config.outDir)
        cli.ok("Finished in", (new Date().getTime() - startTime) / 1000 + "s");
    } else
        return void new Server(app).init(args["--port"], args["--addr"], config.devServer);

    app.destruct();
})()
