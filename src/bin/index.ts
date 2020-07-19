import {getUserConfig, parseConfig} from "./ConfigMapper"
import {getArgs} from "./ArgsMapper";

(async () => {
    const args = getArgs()
    const config = parseConfig(getUserConfig(args["--conf"]), args)
    console.log(config)
})()