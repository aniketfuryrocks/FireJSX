import {Plugin} from "../types/Plugin";
import {$} from "../FireJSX";


export async function mapPlugin(plugin: string, $: $) {
    //require default and call
    await <Plugin>(require(require.resolve(plugin, {paths: [$.config.paths.root]})).default)({
        initWebpack: (page, callback) => {
            if (page === '*')
                callback($.pageArchitect.webpackArchitect.defaultConfig)
            else
                $.hooks.initWebpack.push(callback)
        },
        onBuild: (page, callback) => {
            if (page === '*')
                $.pageMap.get(page).hooks.onBuild.push(callback)
            else
                $.hooks.onBuild.push(callback)
        },
        postRender: (page, callback) => {
            if (page === '*')
                $.pageMap.get(page).hooks.postRender.push(callback)
            else
                $.hooks.postRender.push(callback)
        },
        initServer: $.hooks.initServer.push,
        postExport: $.hooks.initServer.push
    }, $)
}