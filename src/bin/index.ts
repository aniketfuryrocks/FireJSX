import {getUserConfig, parseConfig} from "./ConfigMapper"
import {getArgs} from "./ArgsMapper";
import FireJSX from "../FireJSX";
import Cli from "../utils/Cli";

(async () => {
    const args = getArgs()
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
        verbose: args["--verbose"]
    })
    console.log(config)
})()