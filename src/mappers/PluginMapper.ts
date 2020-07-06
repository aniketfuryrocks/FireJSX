import {Extra, Plugin} from "../types/Plugin";

interface Options {
    path: string,
    root: string,
    extra: Extra
}

export default async function
    mapPlugin({path, root, extra}: Options) {
    //list of exports
    const rawPlugs = <{ [key: string]: Plugin }>require(require.resolve(path, {paths: [root]}))
    //iterate
    for (const plugName in rawPlugs) {
        (<Plugin>rawPlugs[plugName])({
            initWebpack: (page, callback) => {
                if (page === '*')
                    callback(extra.$.pageArchitect.webpackArchitect.defaultConfig)
            }
        }, extra)
    }
}