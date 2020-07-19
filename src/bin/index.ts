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
        cli.ok(`Using ${config ? args["--conf"] || resolve('firejsx.yml') : "default"} config`)
        return config || {}
    })(), args)

    if (args["--disable-plugins"])
        config.plugins = []

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
    const server = new Server(app)
    await server.init(args["--port"], args["--addr"], config.devServer.gzip, config.paths.static)
})().catch(cli.error)