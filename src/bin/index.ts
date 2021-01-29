#!/usr/bin/env node
import {getUserConfig, parseConfig, TrimmedConfig} from "./ConfigMapper"
import {Args, getArgs, parseArgs} from "./ArgsMapper";
import * as MemoryFS from "memory-fs";
import App from "../SSB";
import SSB from "../SSB";
import Cli from "../utils/Cli";
import Server from "../Server";

export default class {

    args: Args;
    cli: Cli;
    app: SSB;
    config: TrimmedConfig;

    constructor() {
        this.args = parseArgs(getArgs());
        this.cli = new Cli(this.args["--log-mode"]);
        this.config = parseConfig((() => {
            const [path, config] = getUserConfig(this.args["--conf"])
            this.cli.ok(`Using ${path} config`)
            return config || {}
        })(), this.args, this.cli)

        if (this.args["--disable-plugins"])
            this.config.plugins = []

        this.app = new App({
            outDir: this.config.outDir,
            cacheDir: this.config.cacheDir,
            prefix: this.config.prefix,
            pages: this.config.pages,
            plugins: this.config.plugins,
            lib: this.config.lib,
            custom: this.config.custom,
            cli: this.cli,
            args: this.args,
            staticDir: this.config.staticDir,
            pro: !!this.args["--pro"],
            ssr: !!this.args["--ssr"],
            watch: !(this.args["--export"] || this.args["--export-fly"]),
            staticPrefix: this.config.staticPrefix,
            verbose: !!this.args["--verbose"],
            outputFileSystem: (this.args["--disk"] || this.args["--export-fly"] || this.args["--export"]) ? undefined : new MemoryFS(),
            appPath: this.config.app
        })
        //log
        this.cli.ok("ENV :", process.env.NODE_ENV)
        this.cli.ok("SSR :", this.app.$.ssr)
        this.cli.ok("HMR :", !this.app.$.pageArchitect.webpackArchitect.proOrSSR)
        this.cli.ok("Watch :", this.app.$.watch)
    }

    async init() {
        await this.app.init()
    }

    async run() {
        // switch according tio modes
        if (this.args["--export"]) {
            const startTime = new Date().getTime();
            this.cli.ok("Exporting");
            await this.app.export()
            this.cli.ok("Exported to", this.config.outDir)
            this.cli.ok("Finished in", (new Date().getTime() - startTime) / 1000 + "s");
            if (this.config.staticDir)
                this.cli.warn("Don't forget to copy the static folder");
        } else if (this.args["--export-fly"]) {
            const startTime = new Date().getTime();
            this.cli.ok("Exporting for on the fly rendering");
            //warn user
            if (!this.app.$.pro)
                this.cli.warn("Exporting a development build")
            if (!this.app.$.ssr)
                this.cli.warn("Exported build won't be able to render your app. Only a html skeleton will be produced.")
            //export
            await this.app.exportFly()
            this.cli.ok("Exported to", this.config.outDir)
            this.cli.ok("Finished in", (new Date().getTime() - startTime) / 1000 + "s");
        } else
            return void new Server(this.app).init(this.args["--port"], this.args["--addr"], this.config.devServer);

        this.app.destruct();
    }

}

(async function () {
    const c = new exports.default();
    c.init();
    c.run();
})()