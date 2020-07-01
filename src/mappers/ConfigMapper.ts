import {isAbsolute, join, resolve} from "path"
import {parse as parseYaml} from "yaml";
import * as fs from "fs"

export interface Config {
    pro?: boolean,          //production mode when true, dev mode when false
    verbose?: boolean,
    logMode?: "plain" | "silent",
    disablePlugins?: boolean,
    ssr?: boolean,
    paths?: {                   //paths absolute or relative to root
        root?: string,          //project root, default : process.cwd()
        src?: string,           //src dir, default : root/src
        pages?: string,         //pages dir, default : root/src/pages
        out?: string,           //production dist, default : root/out
        dist?: string,          //production dist, default : root/out/dist
        cache?: string,         //cache dir, default : root/out/.cache
        fly?: string,           //cache dir, default : root/out/fly
        lib?: string,           //dir where chunks are exported, default : root/out/dist/lib
        map?: string,           //dir where chunk map and page data is exported, default : root/out/dist/lib/map
        static?: string,        //dir where page static elements are stored eg. images, default : root/src/static
    },
    plugins?: [],
    pages?: ExplicitPages
}

export interface ExplicitPages {
    "404"?: string       //404 page, default : 404.js
}

export default class {
    inputFileSystem
    outputFileSystem

    constructor(inputFileSystem = fs, outputFileSystem = fs) {
        this.inputFileSystem = inputFileSystem;
        this.outputFileSystem = outputFileSystem;
    }

    public getUserConfig(path: string): Config | undefined | never {
        const wasGiven = !!path;
        if (path) {//tweak conf path
            if (!isAbsolute(path))
                path = resolve(process.cwd(), path);//create absolute path
        } else
            path = resolve(process.cwd(), `firejsx.yml`);

        if (this.inputFileSystem.existsSync(path))
            return parseYaml(this.inputFileSystem.readFileSync(path, "utf8").toString()) || {};
        else if (wasGiven)
            throw new Error(`Config not found at ${path}`)
    }


    public getConfig(config: Config = {}): Config {
        config.paths = config.paths || {};
        this.throwIfNotFound("root dir", config.paths.root = config.paths.root ? this.makeAbsolute(process.cwd(), config.paths.root) : process.cwd());
        this.throwIfNotFound("src dir", config.paths.src = config.paths.src ? this.makeAbsolute(config.paths.root, config.paths.src) : join(config.paths.root, "src"));
        this.throwIfNotFound("pages dir", config.paths.pages = config.paths.pages ? this.makeAbsolute(config.paths.root, config.paths.pages) : join(config.paths.src, "pages"));
        //out
        this.makeDirIfNotFound(config.paths.out = config.paths.out ? this.makeAbsolute(config.paths.root, config.paths.out) : join(config.paths.root, "out"));
        this.makeDirIfNotFound(config.paths.cache = config.paths.cache ? this.makeAbsolute(config.paths.root, config.paths.cache) : join(config.paths.out, ".cache"));
        this.makeDirIfNotFound(config.paths.fly = config.paths.fly ? this.makeAbsolute(config.paths.root, config.paths.fly) : join(config.paths.out, "fly"));
        this.makeDirIfNotFound(config.paths.dist = config.paths.dist ? this.makeAbsolute(config.paths.root, config.paths.dist) : join(config.paths.out, "dist"));
        this.makeDirIfNotFound(config.paths.lib = config.paths.lib ? this.makeAbsolute(config.paths.root, config.paths.lib) : join(config.paths.dist, "lib"));
        this.makeDirIfNotFound(config.paths.map = config.paths.map ? this.makeAbsolute(config.paths.root, config.paths.map) : join(config.paths.lib, "map"));
        //static dir
        this.undefinedIfNotFound(config.paths, "static", config.paths.root, config.paths.src, "static dir");
        //pages
        config.pages = config.pages || {};
        this.throwIfNotFound("404 page", join(config.paths.pages, config.pages["404"] = config.pages["404"] || "404.js"), "Make sure you have a 404 page");
        //ssr convert to boolean
        config.ssr = !!config.ssr;
        config.plugins = config.disablePlugins ? [] : config.plugins || [];
        return config;
    }

    private makeAbsolute(root: string, pathTo: string) {
        return isAbsolute(pathTo) ? pathTo : resolve(root, pathTo);
    }

    private throwIfNotFound(name: string, pathTo: string, extra = "") {
        if (!this.inputFileSystem.existsSync(pathTo))
            throw new Error(`${name} not found. ${pathTo}\n${extra}`);
    }

    private undefinedIfNotFound<T extends { [key: string]: string }, K extends keyof T>(object: T, property: K, pathRoot: string, defaultRoot: string, msg: string) {
        if (object[property]) {
            object[property] = this.makeAbsolute(pathRoot, object[property]) as T[K];
            this.throwIfNotFound(msg, object[property])
        } else if (!this.inputFileSystem.existsSync(object[property] = resolve(defaultRoot, property as string) as T[K]))
            object[property] = undefined;
    }


    private makeDirIfNotFound(path: string) {
        if (!this.outputFileSystem.existsSync(path))
            this.outputFileSystem.mkdirp(path, () => {
            });
    }
}