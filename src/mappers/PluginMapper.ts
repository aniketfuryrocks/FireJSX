import {Actions, Plugin} from "../types/Plugin";
import {$} from "../FireJSX";

export async function mapPlugin(plugin: string, $: $) {
    //require default and call
    await <Plugin>(require(require.resolve(plugin, {paths: [$.config.paths.root]})).default)({
        initWebpack: (page, callback) => check('initWebpack', plugin, $, page, callback),
        onBuild: (page, callback) => check('onBuild', plugin, $, page, callback),
        postRender: (page, callback) => check('postRender', plugin, $, page, callback),
        initServer: $.hooks.initServer.push,
        postExport: $.hooks.initServer.push
    }, $)
}

function check(action: keyof Actions, plugin, $, page: string, callback): void {
    if (!page)
        throw new Error(`No page provided by ${action} method of plugin ${plugin}`)
    if (!callback)
        throw new Error(`No callback provided by ${action} method of plugin ${plugin}`)

    if (page === '*')
        $.hooks[action].push(callback)
    else {
        const _page = $.pageMap.get(page)
        if (_page)
            _page.hooks[action].push(callback)
        else
            throw new Error(`Page ${page} requested by ${action} method of plugin ${plugin} does not exist`)
    }
}