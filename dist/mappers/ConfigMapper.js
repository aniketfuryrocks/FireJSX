"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const yaml_1 = require("yaml");
const fs = require("fs");
class default_1 {
    constructor(inputFileSystem = fs, outputFileSystem = fs) {
        this.inputFileSystem = inputFileSystem;
        this.outputFileSystem = outputFileSystem;
    }
    getUserConfig(path) {
        const wasGiven = !!path;
        if (path) { //tweak conf path
            if (!path_1.isAbsolute(path))
                path = path_1.resolve(process.cwd(), path); //create absolute path
        }
        else
            path = path_1.resolve(process.cwd(), `firejsx.yml`);
        if (this.inputFileSystem.existsSync(path))
            return yaml_1.parse(this.inputFileSystem.readFileSync(path, "utf8").toString()) || {};
        else if (wasGiven)
            throw new Error(`Config not found at ${path}`);
    }
    getConfig(config = {}) {
        config.paths = config.paths || {};
        this.throwIfNotFound("root dir", config.paths.root = config.paths.root ? this.makeAbsolute(process.cwd(), config.paths.root) : process.cwd());
        this.throwIfNotFound("src dir", config.paths.src = config.paths.src ? this.makeAbsolute(config.paths.root, config.paths.src) : path_1.join(config.paths.root, "src"));
        this.throwIfNotFound("pages dir", config.paths.pages = config.paths.pages ? this.makeAbsolute(config.paths.root, config.paths.pages) : path_1.join(config.paths.src, "pages"));
        //out
        this.makeDirIfNotFound(config.paths.out = config.paths.out ? this.makeAbsolute(config.paths.root, config.paths.out) : path_1.join(config.paths.root, "out"));
        this.makeDirIfNotFound(config.paths.cache = config.paths.cache ? this.makeAbsolute(config.paths.root, config.paths.cache) : path_1.join(config.paths.out, ".cache"));
        this.makeDirIfNotFound(config.paths.fly = config.paths.fly ? this.makeAbsolute(config.paths.root, config.paths.fly) : path_1.join(config.paths.out, "fly"));
        this.makeDirIfNotFound(config.paths.dist = config.paths.dist ? this.makeAbsolute(config.paths.root, config.paths.dist) : path_1.join(config.paths.out, "dist"));
        this.makeDirIfNotFound(config.paths.lib = config.paths.lib ? this.makeAbsolute(config.paths.root, config.paths.lib) : path_1.join(config.paths.dist, "lib"));
        this.makeDirIfNotFound(config.paths.map = config.paths.map ? this.makeAbsolute(config.paths.root, config.paths.map) : path_1.join(config.paths.lib, "map"));
        //static dir
        this.undefinedIfNotFound(config.paths, "static", config.paths.root, config.paths.src, "static dir");
        //pages
        config.pages = config.pages || {};
        this.throwIfNotFound("404 page", path_1.join(config.paths.pages, config.pages["404"] = config.pages["404"] || "404.js"), "Make sure you have a 404 page");
        //ssr convert to boolean
        config.ssr = !!config.ssr;
        config.plugins = config.disablePlugins ? [] : config.plugins || [];
        //custom
        config.custom = config.custom || {};
        return config;
    }
    makeAbsolute(root, pathTo) {
        return path_1.isAbsolute(pathTo) ? pathTo : path_1.resolve(root, pathTo);
    }
    throwIfNotFound(name, pathTo, extra = "") {
        if (!this.inputFileSystem.existsSync(pathTo))
            throw new Error(`${name} not found. ${pathTo}\n${extra}`);
    }
    undefinedIfNotFound(object, property, pathRoot, defaultRoot, msg) {
        if (object[property]) {
            object[property] = this.makeAbsolute(pathRoot, object[property]);
            this.throwIfNotFound(msg, object[property]);
        }
        else if (!this.inputFileSystem.existsSync(object[property] = path_1.resolve(defaultRoot, property)))
            object[property] = undefined;
    }
    makeDirIfNotFound(path) {
        if (!this.outputFileSystem.existsSync(path))
            this.outputFileSystem.mkdirp(path, () => {
            });
    }
}
exports.default = default_1;
