import {WebpackConfig, $} from "../FireJSX";
import {JSDOM} from "jsdom";

type initWebpack_Callback = (config: WebpackConfig) => void
type initServer_Callback = (server: Express.Application) => void
type emptyAsync_Callback = () => Promise<void>
type onBuild_Callback = (actions: onBuild_Actions) => Promise<void>
type postRender_Callback = (dom: JSDOM) => void

interface onBuild_Actions {
    renderPage: (path: string, content?: any) => void
}

interface Actions {
    //Globals
    initServer: (callback: initServer_Callback) => void,
    postExport: (callback: emptyAsync_Callback) => void,
    //Globals and Page
    initWebpack: (page: string, callback: initWebpack_Callback) => void,
    postRender: (page: string, callback: postRender_Callback) => void
    //Page
    onBuild: (page: string, callback: onBuild_Callback) => void,
}


type Plugin = (actions: Actions, $: $) => void

interface PageHooks {
    initWebpack: initWebpack_Callback[],
    postRender: postRender_Callback[],
    onBuild: onBuild_Callback[]
}

interface GlobalHooks extends PageHooks {
    initServer: initServer_Callback[],
    postExport: emptyAsync_Callback[]
}