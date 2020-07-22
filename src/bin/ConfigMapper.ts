import {resolve} from "path"
import {Args} from "./ArgsMapper";
import {parse as parseYaml} from "yaml";
import {mkdirp} from "fs-extra";
import {existsSync, readFileSync} from "fs";
import {devServerConfig} from "../Server";

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
    devServer?: devServerConfig
}

export function getUserConfig(path: string): [string, Config] | never {
    //check if path was given
    if (path)
        if (existsSync(path = resolve(path)))
            if (path.endsWith(".yml"))
                return [path, parseYaml(readFileSync(path, "utf8").toString()) || {}]
            else if (path.endsWith(".js"))
                return [path, require(path).default || {}]
            else
                throw new Error("Unknown config file type. Expected [.js, .yml]")
        else
            throw new Error(`Config not found at ${path}`)
    //if not then check defaults
    else if (existsSync(path = resolve("firejsx.yml")))
        return [path, parseYaml(readFileSync(path, "utf8").toString()) || {}]
    else if (existsSync(path = resolve("firejsx.js")))
        return [path, require(path).default || {}]
    else
        return ["default", {}]
}

export function parseConfig(config: Config = {}, args: Args = {_: []}): TrimmedConfig {
    config.paths = config.paths || {}
    config.devServer = config.devServer || {}
    const out = makeDirIfNotFound(resolve(args["--out"] || config.paths.out || "out"))
    const staticDir = undefinedIfNotFound(args["--static"] || config.paths.static || "src/static")
    const prefix = args["--prefix"] || config.prefix || ""
    return {
        outDir: makeDirIfNotFound(resolve(args["--disk"] ? config.paths.disk || `${out}/disk` :
            args["--export"] ? args["--dist"] || config.paths.dist || `${out}/dist` :
                args["--export-fly"] ? args["--fly"] || config.paths.fly || `${out}/fly` :
                    config.paths.disk || `${out}/disk`)),
        cacheDir: makeDirIfNotFound(resolve(args["--cache"] || config.paths.cache || `${out}/.cache`)),
        pages: throwIfNotFound("pages dir", resolve(args["--pages"] || config.paths.pages || "src/pages")),
        staticDir,
        lib: config.lib || "lib",
        prefix,
        staticPrefix: args["--static-prefix"] || config.staticPrefix || (() => {
            const dirName = staticDir.substring(staticDir.lastIndexOf("/"))
            return prefix === "" ? dirName : (prefix + dirName)
        })(),
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