import {$, WebpackConfig} from "../SSB";
import {Application} from "express"

export type initWebpack_Callback = (config: WebpackConfig) => void
export type initServer_Callback = (server: Application) => void
export type postExport_Callback = () => Promise<void>
export type onBuild_Callback = (actions: onBuild_Actions) => Promise<void>
export type dom_Callback = (html: string) => void

export interface onBuild_Actions {
    renderPage: (path: string, content?: any) => Promise<void>
}

export interface Actions {
    //Globals
    initServer: (callback: initServer_Callback) => void,
    postExport: (callback: postExport_Callback) => void,
    //Globals and Page
    postRender: (page: string, callback: dom_Callback) => void
    //Page
    initWebpack: (callback: initWebpack_Callback) => void,
    onBuild: (page: string, callback: onBuild_Callback) => void,
}


export type Plugin = (actions: Actions, $: $) => Promise<void>

export interface PageHooks {
    postRender: dom_Callback[],
    onBuild: onBuild_Callback[]
}

export interface GlobalHooks {
    initWebpack: initWebpack_Callback[],
    postRender: dom_Callback[],
    initServer: initServer_Callback[],
    postExport: postExport_Callback[]
}
