import {Actions, Plugin} from "../types/Plugin";
import {$} from "../FireJSX";

export async function mapPlugin(plugin: string, $: $) {
    //require default and call
    const plug = <Plugin>require(require.resolve(plugin, {paths: [$.config.paths.root]})).default
    if (plug)
        await plug({
            initWebpack: (page, callback) => check('initWebpack', plugin, $, page, callback),
            onBuild: (page, callback) => check('onBuild', plugin, $, page, callback, false),
            postRender: (page, callback) => check('postRender', plugin, $, page, callback),
            initServer: $.hooks.initServer.push,
            postExport: $.hooks.initServer.push
        }, $)
    else
        throw new Error(`Plugin ${plugin} has no default export`)
}

function check(action: keyof Actions, plugin, $, page: string, callback, wildcard = true): void {
    if (!page)
        throw new Error(`No page provided by ${action} method of plugin ${plugin}`)
    if (!callback)
        throw new Error(`No callback provided by ${action} method of plugin ${plugin}`)

    if (page === '*') {
        if (wildcard)
            $.hooks[action].push(callback)
        else
            throw new Error(`Wildcard * is not valid for ${action} method of plugin ${plugin}`)
    } else {
        const _page = $.pageMap.get(page)
        if (_page)
            _page.hooks[action].push(callback)
        else
            throw new Error(`Page ${page} requested by ${action} method of plugin ${plugin} does not exist`)
    }
}