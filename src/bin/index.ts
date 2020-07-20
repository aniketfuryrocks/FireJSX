#!/usr/bin/env node
import {getUserConfig, parseConfig} from "./ConfigMapper"
import {getArgs, parseArgs} from "./ArgsMapper";
import * as MemoryFS from "memory-fs";
import FireJSX from "../FireJSX";
import Cli from "../utils/Cli";
import {resolve} from "path";
import Server from "../Server";

const args = parseArgs(getArgs())
const cli = new Cli(args["--log-mode"]);

(async () => {
    const config = parseConfig((() => {
        const config = getUserConfig(args["--conf"] || 'firejsx.yml')
        cli.ok(`Using config : ${config ? args["--conf"] || resolve('firejsx.yml') : "default"}`)
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
        cli,
        args,
        pro: args["--export-fly"] ? true : !!args["--pro"],
        ssr: args["--export-fly"] ? true : !!args["--ssr"],
        staticPrefix: config.staticPrefix,
        verbose: !!args["--verbose"],
        outputFileSystem: (args["--disk"] || args["--export-fly"] || args["--export"]) ? undefined : new MemoryFS(),
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
        await new Server(app).init(args["--port"], args["--addr"], config.devServer.gzip, config.staticDir)
})().catch(cli.error)