import {getUserConfig, parseConfig} from "./ConfigMapper"
import {getArgs, parseArgs} from "./ArgsMapper";
import * as MemoryFS from "memory-fs";
import FireJSX from "../FireJSX";
import Cli from "../utils/Cli";

(async () => {
    const args = parseArgs(getArgs())
    const config = parseConfig(getUserConfig(args["--conf"]), args)

    const app = new FireJSX({
        outDir: config.paths.out,
        prefix: config.prefix,
        pages: config.paths.pages,
        plugins: config.plugins,
        lib: config.lib,
        cli: new Cli(args["--log-mode"]),
        args,
        pro: !!args["--pro"],
        ssr: !!args["--ssr"],
        staticPrefix: config.staticPrefix,
        verbose: !!args["--verbose"],
        outputFileSystem: (args["--disk"] || args["--export-fly"] || args["--export"]) ? undefined : new MemoryFS(),
    })

    console.log(config)
})()