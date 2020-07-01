import SmartArg from "smartarg/SmartArg";

export interface Args {
    //mode
    "--pro": boolean,                  //Production mode
    "--export": boolean,               //Export
    "--export-fly": boolean,           //Export path for on the fly builds
    "--disk": boolean,                 //Write to disk instead of memory
    "--ssr": boolean,                  //Server Side Render, Enabled when exporting
    //dev server
    "--port": number,                  //port for dev server eg 5001,5003
    "--addr": string,                  //address for dev server eg 127.0.0.2, 127.0.2.10
    //conf
    "--conf": string,                  //Path to Config file
    //log
    "--verbose": boolean,              //Log Webpack Stat
    "--log-mode": "silent" | "plain",  //Log Mode. silent(log error only) | plain(Log without styling i.e colors and symbols)
    "--disable-plugins": boolean,      //Disable plugins
    //path
    "--root": string,      //project root, default : process.cwd()
    "--src": string,       //src dir, default : root/src
    "--pages": string,     //pages dir, default : root/src/pages
    "--out": string,       //production dist, default : root/out
    "--dist": string,      //production dist, default : root/out/dist
    "--cache": string,     //cache dir, default : root/out/.cache
    "--fly": string,       //cache dir, default : root/out/fly
    "--lib": string,       //dir where chunks are exported, default : root/out/dist/lib
    "--map": string,       //dir where chunk map and page data is exported, default : root/out/dist/lib/map
    "--static": string,    //dir where page static elements are stored eg. images, default : root/src/static
    "--plugins": string,   //plugins dir, default : root/src/plugins
}

export function getArgs(): Args {
    return <Args>new SmartArg<Args>()
        .name("Fire JS")
        .description("A zero config, highly customizable, progressive react static site generator with blazingly fast SSR and on the fly builds.")
        // @ts-ignore
        .version(global.__FIREJSX_VERSION__)
        //mode
        .option(["-p", "--pro"], Boolean, "use production chunks. NODE_ENV : production")
        .option(["-e", "--export"], Boolean, "export project for distribution")
        .option(["-d", "--disk"], Boolean, "store chunks to disk instead of memory while in dev server")
        .option(["-s", "--ssr"], Boolean, "Server Side Render. Available only with -d and -e")
        .option(["-E", "--export-fly"], Boolean, "export project for distribution and for fly build")
        //dev server
        .option(["--port"], Number, "port for dev server, default: 5000")
        .option(["--addr"], String, "address for dev server, default: localhost")
        //conf
        .option(["-c", "--conf"], String, "path to code config file")
        //logging
        .option(["-V", "--verbose"], Boolean, "print webpack stats on error")
        .option(["-l", "--log-mode"], String, "Log Mode. silent (log errors only) | plain (Log without styling i.e colors and symbols)")
        //plugins
        .option(["--disable-plugins"], Boolean, "disable plugins")
        //paths
        .option(["--root"], String, "path to project root, default : process.cwd()")
        .option(["--src"], String, "path to src dir, default : root/src")
        .option(["--pages"], String, "path to pages dir, default : root/src/pages")
        .option(["--out"], String, "path to output dir, default : root/out")
        .option(["--dist"], String, "path to dir where build is exported, default : root/out/dist")
        .option(["--cache"], String, "path to cache dir, default : root/out/.cache")
        .option(["--fly"], String, "path to dir where fly build is exported, default : root/out/fly")
        .option(["--lib"], String, "path to dir where chunks are exported, default : root/out/dist/lib")
        .option(["--map"], String, "path to dir where chunk map and page data is exported, default : root/out/dist/lib/map")
        .option(["--static"], String, "path to dir where static assets are stored eg. images, default : root/src/static")
        .option(["--plugins"], String, "path to plugins dir, default : root/src/plugins")
        .example("firejsx -esp", "export server side rendered production build")
        .example("firejsx -dsp", "write to disk when using dev server with server side rendered production build")
        .smartParse()
}