import {join} from "path"
import {watch} from "chokidar"
import FireJS, {$} from "./FireJSX"
import Page from "./classes/Page";
import express = require("express");
import webpackhot = require("webpack-hot-middleware");

export default class {
    private readonly $: $
    private readonly app: FireJS;

    constructor(app: FireJS) {
        this.app = app;
        this.$ = app.getContext();
        this.$.pageArchitect.webpackArchitect.defaultConfig.watch = true;
    }

    async init(port: number = 5000, addr: string = "localhost") {
        //init server
        const server: express.Application = express();
        //turn off caching
        server.use((req, res, next) => {
            res.setHeader('Surrogate-Control', 'no-store');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            next();
        })
        //init plugins
        this.$.globalPlugins.forEach(plugin => plugin.initServer(server))
        //watch changes
        this.$.cli.ok("Watching for file changes")
        watch(this.$.config.paths.pages)
            .on('add', path => {
                path = path.replace(this.$.config.paths.pages + "/", "");
                const page = this.$.pageMap.get(path) || new Page(path);
                this.$.pageMap.set(page.toString(), page);
                const compiler = this.app.buildPage(page, () => {
                    }, (e) =>
                        this.$.cli.error(`Error while rendering page ${page.toString()}\n`, e)
                );
                server.use(webpackhot(compiler, {
                    log: false,
                    path: `/__webpack_hmr_/${page.toString()}`
                }));
            })
            .on('unlink', path => {
                const page = this.$.pageMap.get(path.replace(this.$.config.paths.pages + "/", ""));
                page.chunks.forEach(chunk => {
                    this.$.outputFileSystem.unlinkSync(join(this.$.config.paths.lib, chunk));
                })
                this.$.pageMap.delete(path.replace(this.$.config.paths.pages + "/", ""));
            });
        //routing
        if (this.$.config.paths.static)
            server.use(`${this.$.config.paths.static.substring(this.$.config.paths.static.lastIndexOf("/"))}`, express.static(this.$.config.paths.static));
        server.get(`/${this.$.rel.mapRel}/*`, this.get.bind(this))
        server.get(`/${this.$.rel.libRel}/*`, this.get.bind(this))
        server.use('*', this.getPage.bind(this));
        //listen
        const listener = server.listen(port, addr, () => {
            // @ts-ignore
            let {port, address} = listener.address();
            if (this.$.config.logMode === "plain")
                this.$.cli.normal(`Listening at http://${address}:${port}`);
            else
                this.$.cli.normal(
                    " \n \x1b[32m┌─────────────────────────────────────────┐\n" +
                    " │                                         │\n" +
                    ` │   Listening at http://${address}:${port}    │\n` +
                    " │                                         │\n" +
                    " └─────────────────────────────────────────┘\x1b[0m\n")
        })
    }

    private get(req: express.Request, res: express.Response) {
        // @ts-ignore
        const pathname = join(this.$.config.paths.dist, decodeURI(req._parsedUrl.pathname));
        if (this.$.outputFileSystem.existsSync(pathname))
            res.write(this.$.outputFileSystem.readFileSync(pathname));
        else
            res.status(404);
        res.end();
    }

    private getPage(req: express.Request, res: express.Response, next) {
        // @ts-ignore
        const pathname = decodeURI(req._parsedUrl.pathname);
        if (pathname.startsWith("/__webpack_hmr")) {
            next();
            return;
        }
        try {
            let path = join(this.$.config.paths.dist, pathname);
            if (this.$.outputFileSystem.existsSync(join(path, "index.html")))
                res.end(this.$.outputFileSystem.readFileSync(join(path, "index.html")));
            else if (this.$.outputFileSystem.existsSync(path + ".html"))
                res.end(this.$.outputFileSystem.readFileSync(path + ".html"))
            else {
                const _404 = this.$.pageMap.get(this.$.config.pages["404"]).toString();
                res.end(this.$.outputFileSystem.readFileSync(join(this.$.config.paths.dist, _404.substring(0, _404.lastIndexOf(".")) + ".html")));
            }
        } catch (e) {
            this.$.cli.error("Error serving " + pathname);
            res.status(500);
        }
    }
}