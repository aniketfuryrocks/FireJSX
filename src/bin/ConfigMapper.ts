import {resolve} from "path"
import {Args} from "./ArgsMapper";
import {parse as parseYaml} from "yaml";
import {mkdirp} from "fs-extra";
import {existsSync, readFileSync} from "fs";

export interface TrimmedConfig {
    outDir?: string,
    cacheDir?: string,
    staticDir?: string,
    lib?: string,               //name of the lib folder, defaults to lib
    prefix?: string,
    staticPrefix?: string,
    plugins?: [],
    custom?: { [key: string]: any },
    pages?: string
    devServer?: {
        gzip?: boolean
    }
}

export interface Config {
    paths?: {                   //paths absolute or relative to root
        pages?: string,         //pages dir, default : root/src/pages
        out?: string,           //output dir, default : root/out
        dist?: string,          //production dist, default : root/out/dist
        cache?: string,         //cache dir, default : root/out/.cache
        fly?: string,           //fly export dir, default : root/out/fly
        disk?: string,          //disk dit, default : root/out/disk
        static?: string,        //dir where page static elements are stored eg. images, default : root/src/static
    },
    lib?: string,               //name of the lib folder, defaults to lib
    prefix?: string,            //path prefix
    staticPrefix?: string,      //static prefix
    plugins?: [],               //plugin
    custom?: { [key: string]: any }, //config fot plugins
    devServer?: {               //dev server
        gzip?: boolean          //compress gzip
    }
}

export function getUserConfig(path: string): Config | never {
    //check if path was given
    if (path) {
        if (existsSync(resolve(path))) {
            if (path.endsWith(".yml"))
                return parseYaml(readFileSync(path, "utf8").toString()) || {};
            else if (path.endsWith(".js"))
                return require(path).default || {}
            else
                throw new Error("Unknown config file type. Expected [.js, .yml]")
        } else
            throw new Error(`Config not found at ${path}`)
    } else {
        if (existsSync(resolve("firejsx.yml"))) {
            return parseYaml(readFileSync(path, "utf8").toString()) || {};
        } else if (existsSync(resolve("firejsx.js"))) {
            return require(path).default || {}
        } else
            return undefined
    }
}

export function parseConfig(config: Config = {}, args: Args = {_: []}): TrimmedConfig {
    config.paths = config.paths || {}
    config.devServer = config.devServer || {}
    const out = makeDirIfNotFound(resolve(args["--out"] || config.paths.out || "out"))
    return {
        outDir: makeDirIfNotFound(resolve(args["--disk"] ? config.paths.disk || `${out}/disk` :
            args["--export"] ? args["--dist"] || config.paths.dist || `${out}/dist` :
                args["--export-fly"] ? args["--fly"] || config.paths.fly || `${out}/fly` :
                    config.paths.disk || `${out}/disk`)),
        cacheDir: makeDirIfNotFound(resolve(args["--cache"] || config.paths.cache || `${out}/.cache`)),
        pages: throwIfNotFound("pages dir", resolve(args["--pages"] || config.paths.pages || "src/pages")),
        staticDir: undefinedIfNotFound(args["--static"] || config.paths.static || "src/static"),
        lib: config.lib || "lib",
        prefix: args["--prefix"] || config.prefix || "",
        staticPrefix: args["--static-prefix"] || config.staticPrefix || "/static",
        devServer: {
            gzip: args["--disable-gzip"] ? false : config.devServer.gzip === undefined ? true : config.devServer.gzip
        },
        custom: config.custom || {},
        plugins: args["--disable-plugins"] ? [] : config.plugins || []
    }
}

function throwIfNotFound(name: string, pathTo: string, extra = ""): never | string {
    if (!existsSync(pathTo))
        throw new Error(`${name} not found. ${pathTo}\n${extra}`);
    return pathTo
}

function undefinedIfNotFound(path): string | undefined {
    return existsSync(path) ? path : undefined
}

function makeDirIfNotFound(path: string) {
    if (!existsSync(path))
        mkdirp(path, e => {
            if (e)
                throw e
        });
    return path
}