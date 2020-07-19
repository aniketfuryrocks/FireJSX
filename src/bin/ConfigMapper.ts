import {isAbsolute, resolve} from "path"
import {Args} from "./ArgsMapper";
import {parse as parseYaml} from "yaml";

export interface Config {
    paths?: {                   //paths absolute or relative to root
        pages?: string,         //pages dir, default : root/src/pages
        out?: string,           //production dist, default : root/out
        dist?: string,          //production dist, default : root/out/dist
        cache?: string,         //cache dir, default : root/out/.cache
        fly?: string,           //cache dir, default : root/out/fly
        static?: string,        //dir where page static elements are stored eg. images, default : root/src/static
    },
    lib?: string,               //name of the lib folder, defaults to lib
    prefix?: string,
    staticPrefix?: string,
    plugins?: [],
    custom?: { [key: string]: any },
    devServer?: {
        gzip?: boolean
    }
}

export function getUserConfig(path: string): Config | undefined | never {
    const wasGiven = !!path;
    if (path) {//tweak conf path
        if (!isAbsolute(path))
            path = resolve(path);//create absolute path
    } else
        path = resolve('firejsx.yml');

    if (this.inputFileSystem.existsSync(path))
        return parseYaml(this.inputFileSystem.readFileSync(path, "utf8").toString()) || {};
    else if (wasGiven)
        throw new Error(`Config not found at ${path}`)
}

export function parseConfig(config: Config = {}, args: Args = {_: []}): Config {
    config.paths = config.paths || {}
    config.devServer = config.devServer || {}
    const out = makeDirIfNotFound(resolve(args["--out"] || config.paths.out || "out"))
    return {
        paths: {
            pages: throwIfNotFound("pages dir", resolve(args["--pages"] || config.paths.pages || "src/pages")),
            out,
            dist: makeDirIfNotFound(resolve(args["--dist"] || config.paths.dist || `${out}/dist`)),
            fly: makeDirIfNotFound(resolve(args["--fly"] || config.paths.fly || `${out}/fly`)),
            cache: makeDirIfNotFound(resolve(args["--cache"] || config.paths.cache || `${out}/.cache`)),
            static: undefinedIfNotFound(resolve(args["--static"] || config.paths.static || `src/static`)),
        },
        lib: config.lib || "lib",
        prefix: args["--prefix"] || config.prefix || "",
        staticPrefix: args["--static-prefix"] || config.staticPrefix || "/static",
        devServer: {
            gzip: config.devServer.gzip === undefined ? true : config.devServer.gzip
        },
        custom: config.custom || {},
        plugins: config.plugins
    }
}

function throwIfNotFound(name: string, pathTo: string, extra = ""): never | string {
    if (!this.inputFileSystem.existsSync(pathTo))
        throw new Error(`${name} not found. ${pathTo}\n${extra}`);
    return pathTo
}

function undefinedIfNotFound(path): string | undefined {
    return this.inputFileSystem.existsSync(path) ? path : undefined
}

function makeDirIfNotFound(path: string) {
    if (!this.outputFileSystem.existsSync(path))
        this.outputFileSystem.mkdirp(path, e => {
            if (e)
                throw e
        });
    return path
}