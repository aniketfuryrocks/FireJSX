import PagePlugin, {PagePlugMinVer} from "../plugins/PagePlugin";
import GlobalPlugin, {GlobalPlugMinVer} from "../plugins/GlobalPlugin";
import Page from "../classes/Page";
import FireJSXPlugin, {PluginCode} from "../plugins/FireJSXPlugin";
import WebpackArchitect from "../architects/WebpackArchitect";

interface gParam {
    webpackArchitect?: WebpackArchitect,
    globalPlugins: GlobalPlugin[],
}

interface pParam {
    pageMap: Map<string, Page>
}

type param = { config: { [key: string]: any }, rootPath: string } & gParam & pParam

export async function mapPlugin(pluginPath: string, {rootPath, pageMap, webpackArchitect, globalPlugins, config}: param) {
    const rawPlugs = require(require.resolve(pluginPath, {paths: [rootPath]}));
    for (const rawPlugKey in rawPlugs) {
        //check for own property
        if (rawPlugs.hasOwnProperty(rawPlugKey)) {
            //get plug from list
            const rawPlug = new (rawPlugs[rawPlugKey])() as FireJSXPlugin;
            //set config
            rawPlug.config = config
            //init
            await rawPlug.init();
            //check for plugCode
            if (rawPlug.plugCode === PluginCode.PagePlugin) {
                //check ver
                checkVer(rawPlug, PagePlugMinVer, rawPlugKey, pluginPath)
                //pass params
                managePagePlugin(<PagePlugin>rawPlug, pluginPath, {
                    pageMap
                });
            } else if (rawPlug.plugCode === PluginCode.GlobalPlugin) {
                //check ver
                checkVer(rawPlug, GlobalPlugMinVer, rawPlugKey, pluginPath)
                //pass params
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

function managePagePlugin(plugin: PagePlugin, pluginFile: string, {pageMap}: pParam): void | never {
    const page = pageMap.get(plugin.page);
    if (page)
        page.plugin = plugin;
    else
        throw new Error(`Page ${plugin.page} requested by PagePlugin ${pluginFile} does not exist`)
}

function manageGlobalPlugin(plugin: GlobalPlugin, pluginFile: string, {webpackArchitect, globalPlugins}: gParam): void | never {
    if (webpackArchitect)
        plugin.initWebpack(webpackArchitect.defaultConfig);
    globalPlugins.push(plugin);
}