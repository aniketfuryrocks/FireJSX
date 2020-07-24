#!/usr/bin/env node
import {getUserConfig, parseConfig} from "./ConfigMapper"
import {getArgs, parseArgs} from "./ArgsMapper";
import * as MemoryFS from "memory-fs";
import FireJSX from "../FireJSX";
import Cli from "../utils/Cli";
import Server from "../Server";

const args = parseArgs(getArgs())
const cli = new Cli(args["--log-mode"]);

async function main() {
    const config = parseConfig((() => {
        const [path, config] = getUserConfig(args["--conf"])
        cli.ok(`Using ${path} config`)
        return config || {}
    })(), args)

    if (args["--disable-plugins"])
        config.plugins = []

    const app = new FireJSX({
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
        pro: args["--export-fly"] ? true : !!args["--pro"],
        ssr: args["--export-fly"] ? true : !!args["--ssr"],
        staticPrefix: config.staticPrefix,
        verbose: !!args["--verbose"],
        outputFileSystem: (args["--disk"] || args["--export-fly"] || args["--export"]) ? undefined : new MemoryFS(),
        cacheModules: true
    })
    //initialize
    await app.init()
    cli.ok("Initialized")
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
        await app.exportFly()
        cli.ok("Exported to", config.outDir)
        cli.ok("Finished in", (new Date().getTime() - startTime) / 1000 + "s");
    } else
        await new Server(app).init(args["--port"], args["--addr"], config.devServer)
}

let doneOnce = false;
const mainInterval = setInterval(() => {
    if (!doneOnce) {
        doneOnce = true;
        main().finally(() => clearInterval(mainInterval)).catch(cli.error)
    }
}, 200)