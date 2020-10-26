import {Actions, Plugin} from "../types/Plugin";
import {$} from "../Api";

export async function mapPlugin(plugin: string, $: $) {
    //require default and call
    const plug = <Plugin>require(require.resolve(plugin, {paths: [process.cwd()]})).default
    if (plug)
        await plug({
            onBuild: (page, callback) => check('onBuild', plugin, $, page, callback, false),
            postRender: (page, callback) => check('postRender', plugin, $, page, callback, true),
            initWebpack: callback => checkCallback($, 'initWebpack', plugin, callback),
            initServer: callback => checkCallback($, 'initServer', plugin, callback),
            postExport: callback => checkCallback($, 'postExport', plugin, callback),
        }, $)
    else
        throw new Error(`Plugin ${plugin} has no default export`)
}

function checkCallback($, name, plugin, callback) {
    if (!callback)
        throw new Error(`Plugin ${plugin} provided not callback for ${name} hook`)
    $.hooks[name].push(callback)
}

function check(action: keyof Actions, plugin, $, page: string, callback, wildcard: boolean): void {
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
