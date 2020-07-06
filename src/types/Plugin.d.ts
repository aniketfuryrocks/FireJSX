import {WebpackConfig, $} from "../FireJSX";
import {Args} from "../mappers/ArgsMapper";
import {JSDOM} from "jsdom";

type initWebpack_Callback = (config: WebpackConfig) => void
type initServer_Callback = (server: Express.Application) => void
type empty_Callback = (server: Express.Application) => void
type onBuild_Callback = (actions: onBuild_Actions) => void
type postRender_Callback = (dom: JSDOM) => void

interface onBuild_Actions {
    renderPage: (path: string, content?: any) => void
}

interface Actions {
    //Globals
    initServer: (callback: initServer_Callback) => void,
    postExport: (callback: empty_Callback) => Promise<void>,
    //Globals and Page
    initWebpack: (page: string, callback: initWebpack_Callback) => void,
    postRender: (page: string, callback: postRender_Callback) => void
    //Page
    onBuild: (page: string, callback: onBuild_Callback) => Promise<void>,
}

interface Extra {
    $: $,
    args: Args
}

type Plugin = (actions: Actions, extra: Extra) => void

interface PageHooks {
    initWebpack: initWebpack_Callback[],
    postRender: postRender_Callback[],
    onBuild: onBuild_Callback[]
}

interface GlobalHooks extends PageHooks {
    initServer: initServer_Callback[],
    postExport: empty_Callback[]
}