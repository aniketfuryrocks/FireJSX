"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPlugin = void 0;
const PagePlugin_1 = require("../plugins/PagePlugin");
const GlobalPlugin_1 = require("../plugins/GlobalPlugin");
const FireJSXPlugin_1 = require("../plugins/FireJSXPlugin");
function mapPlugin(pluginPath, { rootPath, pageMap, webpackArchitect, globalPlugins }) {
    const rawPlugs = require(require.resolve(pluginPath, { paths: [rootPath] }));
    for (const rawPlugKey in rawPlugs) {
        if (rawPlugs.hasOwnProperty(rawPlugKey)) {
            const rawPlug = new (rawPlugs[rawPlugKey])();
            if (rawPlug.plugCode === FireJSXPlugin_1.PluginCode.PagePlugin) {
                checkVer(rawPlug, PagePlugin_1.PagePlugMinVer, rawPlugKey, pluginPath);
                managePagePlugin(rawPlug, pluginPath, pageMap);
            }
            else if (rawPlug.plugCode === FireJSXPlugin_1.PluginCode.GlobalPlugin) {
                checkVer(rawPlug, GlobalPlugin_1.GlobalPlugMinVer, rawPlugKey, pluginPath);
                manageGlobalPlugin(rawPlug, pluginPath, {
                    webpackArchitect,
                    globalPlugins
                });
            }
            else
                throw new Error(`unknown plugin ${rawPlugKey} in ${pluginPath}`);
        }
    }
}
exports.mapPlugin = mapPlugin;
function checkVer(rawPlug, minVer, name, path) {
    if (rawPlug.version < minVer)
        throw new Error(`PagePlugin [${name}] in ${path} is outdated. Expected min version ${minVer} but found ${rawPlug.version}`);
}
function managePagePlugin(plugin, pluginFile, pageMap) {
    const page = pageMap.get(plugin.page);
    if (page)
        page.plugin = plugin;
    else
        throw new Error(`Page ${plugin.page} requested by plugin ${pluginFile} does not exist`);
}
function manageGlobalPlugin(plugin, pluginFile, { webpackArchitect, globalPlugins }) {
    if (webpackArchitect)
        plugin.initWebpack(webpackArchitect.defaultConfig);
    globalPlugins.push(plugin);
}
