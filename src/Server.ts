import {join} from "path"
import FireJS, {$} from "./FireJSX"
import * as express from "express";
import * as webpackHot from "webpack-hot-middleware"
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

    async init(port: number = 5000, addr: string = "localhost", gzip, staticDir) {
        //init server
        const server: express.Application = express();
        //gzip
        this.$.cli.ok("GZIP :", gzip)
        if (gzip)
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

        this.app.buildPages().catch(e => this.$.cli.error(e))

        server.use(webpackHot(this.$.pageArchitect.compiler, {
            log: false,
            path: `/__webpack_hmr`
        }))

        //routing
        if (this.$.staticPrefix)
            server.use(this.$.staticPrefix, express.static(staticDir));
        server.get(`/${this.$.lib}/*`, this.get.bind(this))
        server.get(`/${this.$.lib}/map/*`, this.get.bind(this))
        server.use('*', this.getPage.bind(this));
        //listen
        const listener = server.listen(port, addr, () => {
            // @ts-ignore
            let {port, address} = listener.address();
            if (this.$.cli.mode === "plain")
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
        if (this.$.verbose)
            this.$.cli.log("Request :", req.url)
        // @ts-ignore
        const pathname = join(this.$.outDir, decodeURI(req._parsedUrl.pathname).replace(this.$.prefix, ""))

        res.contentType(mime.getType(pathname.substr(pathname.lastIndexOf("."))))
        if (this.$.outputFileSystem.existsSync(pathname))
            res.write(this.$.outputFileSystem.readFileSync(pathname));
        else
            res.status(404);
        res.end();
    }

    private getPage(req: express.Request, res: express.Response, next) {
        if (this.$.verbose)
            this.$.cli.log("HTML Request :", req.url)
        // @ts-ignore
        const pathname = decodeURI(req._parsedUrl.pathname).replace(this.$.prefix, "")
        // @ts-ignore
        if (req.method === "GET" && !req._parsedUrl.pathname.startsWith("/__webpack_hmr/")) {
            try {
                res.contentType("text/html")
                let path = `${this.$.outDir}/${pathname}`;
                if (this.$.outputFileSystem.existsSync(join(path, "index.html")))
                    res.end(this.$.outputFileSystem.readFileSync(join(path, "index.html")));
                else if (this.$.outputFileSystem.existsSync(path + ".html"))
                    res.end(this.$.outputFileSystem.readFileSync(path + ".html"))
                else {
                    const _404 = this.$.pageMap.get("404.jsx").toString();
                    res.end(this.$.outputFileSystem.readFileSync(join(this.$.outDir, _404.substring(0, _404.lastIndexOf(".")) + ".html")));
                }
            } catch (e) {
                this.$.cli.error("Error serving HTML", pathname, e);
                res.status(500);
            }
        } else
            next()
    }
}