import {join} from "path"
import {watch} from "chokidar"
import FireJS, {$} from "./FireJSX"
import Page from "./classes/Page";
import * as express from "express";
import * as webpackhot from "webpack-hot-middleware"
import * as mime from "mime"
import * as compression from "compression"

export default class {
    private readonly $: $
    private readonly app: FireJS;

    constructor(app: FireJS) {
        this.app = app;
        this.$ = app.getContext();
        this.$.pageArchitect.webpackArchitect.config.watch = true;
    }

    async init(port: number = 5000, addr: string = "localhost") {
        //init server
        const server: express.Application = express();
        //gzip
        this.$.cli.ok("GZIP :", !!this.$.config.devServer.gzip)
        if (this.$.config.devServer.gzip)
            server.use(compression())
        //turn off caching
        server.use((req, res, next) => {
            res.setHeader('Surrogate-Control', 'no-store');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            next();
        })
        //init plugins
        this.$.hooks.initServer.forEach(initServer => initServer(server))
        //watch changes
        this.$.cli.ok("Watching for file changes")
        this.app.buildPages(compiler =>
            server.use(webpackhot(compiler, {
                log: false,
                path: `/__webpack_hmr`
            }))
        ).catch(e => this.$.cli.error(e));

       /* watch(this.$.config.paths.pages)
            .on('add', path => {
                path = path.replace(this.$.config.paths.pages + "/", "");
                const page = this.$.pageMap.get(path) || new Page(path);
                this.$.pageMap.set(page.toString(), page);
                this.app.buildPage(page, compiler => {

                    }
                ).catch(e => this.$.cli.error(e));
            })
            .on('unlink', path => {
                const page = this.$.pageMap.get(path.replace(this.$.config.paths.pages + "/", ""));
                //unlink main
                this.$.outputFileSystem.unlinkSync(join(this.$.config.paths.lib, page.chunks.main));
                //delete others
                (<[keyof PageChunks]><unknown>['lazy', 'css', 'vendor']).forEach(kind =>
                    // @ts-ignore
                    page.chunks[kind].forEach(chunk =>
                        this.$.outputFileSystem.unlinkSync(join(this.$.config.paths.lib, chunk)))
                )
                this.$.pageMap.delete(path.replace(this.$.config.paths.pages + "/", ""));
            });*/

        //routing
        if (this.$.config.paths.static)
            server.use(this.$.config.staticPrefix, express.static(this.$.config.paths.static));
        server.get(this.$.rel.mapRel + '/*', this.get.bind(this))
        server.get(this.$.rel.libRel + '/*', this.get.bind(this))
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
            this.$.cli.ok("Building Pages")
        })
    }

    private get(req: express.Request, res: express.Response) {
        if (this.$.config.verbose)
            this.$.cli.log("Request :", req.url)
        // @ts-ignore
        const pathname = join(this.$.config.paths.dist, decodeURI(req._parsedUrl.pathname).replace(this.$.config.prefix, ""))

        res.contentType(mime.getType(pathname.substr(pathname.lastIndexOf("."))))
        if (this.$.outputFileSystem.existsSync(pathname))
            res.write(this.$.outputFileSystem.readFileSync(pathname));
        else
            res.status(404);
        res.end();
    }

    private getPage(req: express.Request, res: express.Response, next) {
        if (this.$.config.verbose)
            this.$.cli.log("HTML Request :", req.url)
        // @ts-ignore
        const pathname = decodeURI(req._parsedUrl.pathname).replace(this.$.config.prefix, "")
        // @ts-ignore
        if (req.method === "GET" && !req._parsedUrl.pathname.startsWith("/__webpack_hmr/")) {
            try {
                res.contentType("text/html")
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
                this.$.cli.error("Error serving HTML", pathname, e);
                res.status(500);
            }
        } else
            next()
    }
}