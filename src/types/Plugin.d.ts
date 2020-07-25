import {WebpackConfig, $} from "../FireJSX";
import {Application} from "express"

type initWebpack_Callback = (config: WebpackConfig) => void
type initServer_Callback = (server: Application) => void
type postExport_Callback = () => Promise<void>
type onBuild_Callback = (actions: onBuild_Actions) => Promise<void>
type dom_Callback = (html: string) => void

interface onBuild_Actions {
    renderPage: (path: string, content?: any) => void
}

interface Actions {
    //Globals
    initServer: (callback: initServer_Callback) => void,
    postExport: (callback: postExport_Callback) => void,
    //Globals and Page
    postRender: (page: string, callback: dom_Callback) => void
    //Page
    initWebpack: (callback: initWebpack_Callback) => void,
    onBuild: (page: string, callback: onBuild_Callback) => void,
}


type Plugin = (actions: Actions, $: $) => void

interface PageHooks {
    postRender: dom_Callback[],
    onBuild: onBuild_Callback[]
}

interface GlobalHooks {
    initWebpack: initWebpack_Callback[],
    postRender: dom_Callback[],
    initServer: initServer_Callback[],
    postExport: postExport_Callback[]
}