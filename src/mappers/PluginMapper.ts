import PagePlugin, {PagePlugMinVer} from "../plugins/PagePlugin";
import GlobalPlugin, {GlobalPlugMinVer} from "../plugins/GlobalPlugin";
import Page from "../classes/Page";
import FireJSXPlugin, {PluginCode} from "../plugins/FireJSXPlugin";
import WebpackArchitect from "../architects/WebpackArchitect";

interface gParam {
    webpackArchitect?: WebpackArchitect,
    globalPlugins: GlobalPlugin[],
}

interface mParam extends gParam {
    rootPath: string,
    pageMap: Map<string, Page>
}

export function mapPlugin(pluginPath: string, {rootPath, pageMap, webpackArchitect, globalPlugins}: mParam) {
    const rawPlugs = require(require.resolve(pluginPath, {paths: [rootPath]}));
    for (const rawPlugKey in rawPlugs) {
        if (rawPlugs.hasOwnProperty(rawPlugKey)) {
            const rawPlug = new (rawPlugs[rawPlugKey])() as FireJSXPlugin;
            if (rawPlug.plugCode === PluginCode.PagePlugin) {
                checkVer(rawPlug, PagePlugMinVer, rawPlugKey, pluginPath)
                managePagePlugin(<PagePlugin>rawPlug, pluginPath, pageMap);
            } else if (rawPlug.plugCode === PluginCode.GlobalPlugin) {
                checkVer(rawPlug, GlobalPlugMinVer, rawPlugKey, pluginPath)
                manageGlobalPlugin(<GlobalPlugin>rawPlug, pluginPath, {
                    webpackArchitect,
                    globalPlugins
                });
            } else
                throw new Error(`unknown plugin ${rawPlugKey} in ${pluginPath}`)
        }
    }
}

function checkVer(rawPlug: FireJSXPlugin, minVer: number, name: string, path: string) {
    if (rawPlug.version < minVer)
        throw new Error(`PagePlugin [${name}] in ${path} is outdated. Expected min version ${minVer} but found ${rawPlug.version}`)
}

function managePagePlugin(plugin: PagePlugin, pluginFile: string, pageMap: Map<string, Page>): void | never {
    const page = pageMap.get(plugin.page);
    if (page)
        page.plugin = plugin;
    else
        throw new Error(`Page ${plugin.page} requested by plugin ${pluginFile} does not exist`)
}

function manageGlobalPlugin(plugin: GlobalPlugin, pluginFile: string, {webpackArchitect, globalPlugins}: gParam): void | never {
    if (webpackArchitect)
        plugin.initWebpack(webpackArchitect.defaultConfig);
    globalPlugins.push(plugin);
}