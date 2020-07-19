import {getUserConfig, parseConfig} from "./ConfigMapper"
import {getArgs, parseArgs} from "./ArgsMapper";
import * as MemoryFS from "memory-fs";
import FireJSX from "../FireJSX";
import Cli from "../utils/Cli";
import {resolve} from "path";

(async () => {
    const args = parseArgs(getArgs())
    const cli = new Cli(args["--log-mode"])

    const config = parseConfig((() => {
        const config = getUserConfig(args["--conf"] || 'firejsx.yml')
        cli.ok(`Using ${config ? args["--conf"] || resolve('firejsx.yml') : "default"} config`)
        return config || {}
    })(), args)

    const app = new FireJSX({
        outDir: config.paths.out,
        cacheDir: config.paths.cache,
        prefix: config.prefix,
        pages: config.paths.pages,
        plugins: config.plugins,
        lib: config.lib,
        cli,
        args,
        pro: !!args["--pro"],
        ssr: !!args["--ssr"],
        staticPrefix: config.staticPrefix,
        verbose: !!args["--verbose"],
        outputFileSystem: (args["--disk"] || args["--export-fly"] || args["--export"]) ? undefined : new MemoryFS(),
    })
    await app.init()
    cli.ok("Initialized")
})()