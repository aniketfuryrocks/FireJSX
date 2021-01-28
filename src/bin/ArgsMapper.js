"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = exports.getArgs = void 0;
const SmartArg_1 = require("smartarg/SmartArg");
const Globals_1 = require("../Globals");
function getArgs() {
    return new SmartArg_1.default()
        .name("FireJSX")
        .description("The React Framework for SSB, SSR and Serverless technologies")
        // @ts-ignore
        .version(Globals_1.FireJSX_Version)
        //mode
        .option(["-p", "--pro"], Boolean, "use production chunks. NODE_ENV : production")
        .option(["-e", "--export"], Boolean, "export project for distribution")
        .option(["-d", "--disk"], Boolean, "store chunks to disk instead of memory while in dev server")
        .option(["-s", "--ssr"], Boolean, "Server Side Render. Available only with -d and -e")
        .option(["-E", "--export-fly"], Boolean, "export project for distribution and for fly build")
        //prefix
        .option(["--prefix"], String, "Path prefix")
        .option(["--static-prefix"], String, "Static Path prefix")
        //dev server
        .option(["--port"], Number, "port for dev server, default: 5000")
        .option(["--addr"], String, "address for dev server, default: localhost")
        .option(["--disable-gzip"], Boolean, "Disable gzip in dev server")
        //conf
        .option(["-c", "--conf"], String, "path to code config file")
        //logging
        .option(["-V", "--verbose"], Boolean, "print webpack stats on error")
        .option(["-l", "--log-mode"], String, "Log Mode. silent (log errors only) | plain (Log without styling i.e colors and symbols)")
        //plugins
        .option(["--disable-plugins"], Boolean, "disable plugins")
        //paths
        .option(["--pages"], String, "path to pages dir, default : root/src/pages")
        .option(["--dist"], String, "path to dir where build is exported, default : root/out/dist")
        .option(["--fly"], String, "path to dir where fly build is exported, default : root/out/fly")
        .example("firejsx -esp", "export server side rendered production build")
        .example("firejsx -dsp", "write to disk when using dev server with server side rendered production build")
        .smartParse();
}
exports.getArgs = getArgs;
function parseArgs(args) {
    //export fly
    if (args["--export-fly"] && args["--export"])
        throw new Error("flag [-e, --export] are redundant when exporting for fly build. Rerun after removing this flag");
    //check if log mode is valid
    if (args["--log-mode"] && (args["--log-mode"] !== "silent" && args["--log-mode"] !== "plain"))
        throw new Error(`unknown log mode ${args["--log-mode"]}. Expected [ silent | plain ]`);
    //check if disk is not followed by exports
    if (args["--disk"] && (args["--export"] || args["--export-fly"]))
        throw new Error("flags [-d, --disk] are redundant when exporting");
    //ssr only when exporting or disk
    if (args["--ssr"] && !(args["--disk"] || args["--export"] || args["--export-fly"]))
        throw new Error("flags [-s, --ssr] should be accompanied either by flags [-e,--export] or flags [-d, --disk]");
    return args;
}
exports.parseArgs = parseArgs;
