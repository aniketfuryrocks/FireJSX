"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const chokidar_1 = require("chokidar");
const Page_1 = require("./classes/Page");
const express = require("express");
const webpackhot = require("webpack-hot-middleware");
class default_1 {
    constructor(app) {
        this.app = app;
        this.$ = app.getContext();
        this.$.pageArchitect.webpackArchitect.defaultConfig.watch = true;
    }
    init(port = 5000, addr = "localhost") {
        return __awaiter(this, void 0, void 0, function* () {
            //init server
            const server = express();
            //turn off caching
            server.use((req, res, next) => {
                res.setHeader('Surrogate-Control', 'no-store');
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                next();
            });
            //init plugins
            this.$.globalPlugins.forEach(plugin => plugin.initServer(server));
            //watch changes
            this.$.cli.ok("Watching for file changes");
            chokidar_1.watch(this.$.config.paths.pages)
                .on('add', path => {
                path = path.replace(this.$.config.paths.pages + "/", "");
                const page = this.$.pageMap.get(path) || new Page_1.default(path);
                this.$.pageMap.set(page.toString(), page);
                this.app.buildPage(page, compiler => {
                    server.use(webpackhot(compiler, {
                        log: false,
                        path: `/__webpack_hmr_/${page.toString()}`
                    }));
                });
            })
                .on('unlink', path => {
                const page = this.$.pageMap.get(path.replace(this.$.config.paths.pages + "/", ""));
                page.chunks.forEach(chunk => {
                    this.$.outputFileSystem.unlinkSync(path_1.join(this.$.config.paths.lib, chunk));
                });
                this.$.pageMap.delete(path.replace(this.$.config.paths.pages + "/", ""));
            });
            //routing
            if (this.$.config.paths.static)
                server.use(`${this.$.config.paths.static.substring(this.$.config.paths.static.lastIndexOf("/"))}`, express.static(this.$.config.paths.static));
            server.get(`/${this.$.rel.mapRel}/*`, this.get.bind(this));
            server.get(`/${this.$.rel.libRel}/*`, this.get.bind(this));
            server.use('*', this.getPage.bind(this));
            //listen
            const listener = server.listen(port, addr, () => {
                // @ts-ignore
                let { port, address } = listener.address();
                if (this.$.config.logMode === "plain")
                    this.$.cli.normal(`Listening at http://${address}:${port}`);
                else
                    this.$.cli.normal(" \n \x1b[32m┌─────────────────────────────────────────┐\n" +
                        " │                                         │\n" +
                        ` │   Listening at http://${address}:${port}    │\n` +
                        " │                                         │\n" +
                        " └─────────────────────────────────────────┘\x1b[0m\n");
            });
        });
    }
    get(req, res) {
        // @ts-ignore
        const pathname = path_1.join(this.$.config.paths.dist, decodeURI(req._parsedUrl.pathname));
        if (this.$.outputFileSystem.existsSync(pathname))
            res.write(this.$.outputFileSystem.readFileSync(pathname));
        else
            res.status(404);
        res.end();
    }
    getPage(req, res, next) {
        // @ts-ignore
        const pathname = decodeURI(req._parsedUrl.pathname);
        if (pathname.startsWith("/__webpack_hmr")) {
            next();
            return;
        }
        try {
            let path = path_1.join(this.$.config.paths.dist, pathname);
            if (this.$.outputFileSystem.existsSync(path_1.join(path, "index.html")))
                res.end(this.$.outputFileSystem.readFileSync(path_1.join(path, "index.html")));
            else if (this.$.outputFileSystem.existsSync(path + ".html"))
                res.end(this.$.outputFileSystem.readFileSync(path + ".html"));
            else {
                const _404 = this.$.pageMap.get(this.$.config.pages["404"]).toString();
                res.end(this.$.outputFileSystem.readFileSync(path_1.join(this.$.config.paths.dist, _404.substring(0, _404.lastIndexOf(".")) + ".html")));
            }
        }
        catch (e) {
            this.$.cli.error("Error serving " + pathname);
            res.status(500);
        }
    }
}
exports.default = default_1;
