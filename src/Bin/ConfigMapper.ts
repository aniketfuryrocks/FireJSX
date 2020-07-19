import {isAbsolute, join, resolve} from "path"
import {Args} from "./ArgsMapper";

export interface Config {
    paths?: {                   //paths absolute or relative to root
        root?: string,          //project root, default : process.cwd()
        src?: string,           //src dir, default : root/src
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

function parseConfig(config: Config = {}, args: Args = {_: []}): Config {
    config.paths = config.paths || {};
    this.throwIfNotFound("root dir", config.paths.root = config.paths.root ? this.makeAbsolute(process.cwd(), config.paths.root) : process.cwd());
    this.throwIfNotFound("src dir", config.paths.src = config.paths.src ? this.makeAbsolute(config.paths.root, config.paths.src) : join(config.paths.root, "src"));
    this.throwIfNotFound("pages dir", config.paths.pages = config.paths.pages ? this.makeAbsolute(config.paths.root, config.paths.pages) : join(config.paths.src, "pages"));
    //out
    this.makeDirIfNotFound(config.paths.out = config.paths.out ? this.makeAbsolute(config.paths.root, config.paths.out) : join(config.paths.root, "out"));
    this.makeDirIfNotFound(config.paths.cache = config.paths.cache ? this.makeAbsolute(config.paths.root, config.paths.cache) : join(config.paths.out, ".cache"));
    this.makeDirIfNotFound(config.paths.fly = config.paths.fly ? this.makeAbsolute(config.paths.root, config.paths.fly) : join(config.paths.out, "fly"));
    this.makeDirIfNotFound(config.paths.dist = config.paths.dist ? this.makeAbsolute(config.paths.root, config.paths.dist) : join(config.paths.out, "dist"));
    //static dir
    this.undefinedIfNotFound(config.paths, "static", config.paths.root, config.paths.src, "static dir");
    //custom
    config.custom = config.custom || {};
    //server
    config.devServer = config.devServer || {};
    config.devServer.gzip = config.devServer.gzip === undefined ? true : config.devServer.gzip
    //prefix
    config.prefix = config.prefix || "";
    //static prefix
    config.staticPrefix = config.staticPrefix || (() => {
        const dirName = config.paths.static.substring(config.paths.static.lastIndexOf("/"))
        return config.prefix === "" ? dirName : (config.prefix + dirName)
    })()
    //lib
    config.lib = config.prefix + (config.lib || "/lib")
    return config;
}

function makeAbsolute(root: string, pathTo: string) {
    return isAbsolute(pathTo) ? pathTo : resolve(root, pathTo);
}

function throwIfNotFound(name: string, pathTo: string, extra = "") {
    if (!this.inputFileSystem.existsSync(pathTo))
        throw new Error(`${name} not found. ${pathTo}\n${extra}`);
}

function undefinedIfNotFound<T extends { [key: string]: string }, K extends keyof T>(object: T, property: K, pathRoot: string, defaultRoot: string, msg: string) {
    if (object[property]) {
        object[property] = this.makeAbsolute(pathRoot, object[property]) as T[K];
        this.throwIfNotFound(msg, object[property])
    } else if (!this.inputFileSystem.existsSync(object[property] = resolve(defaultRoot, property as string) as T[K]))
        object[property] = undefined;
}

function makeDirIfNotFound(path: string) {
    if (!this.outputFileSystem.existsSync(path))
        this.outputFileSystem.mkdirp(path, () => {
        });
}