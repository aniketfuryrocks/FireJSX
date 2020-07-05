"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PagePlugin_1 = require("../plugins/PagePlugin");
const GlobalPlugin_1 = require("../plugins/GlobalPlugin");
const FireJSXPlugin_1 = require("../plugins/FireJSXPlugin");
function mapPlugin(pluginPath, { rootPath, pageMap, webpackArchitect, globalPlugins, config }) {
    const rawPlugs = require(require.resolve(pluginPath, { paths: [rootPath] }));
    for (const rawPlugKey in rawPlugs) {
        //check for own property
        if (rawPlugs.hasOwnProperty(rawPlugKey)) {
            //get plug from list
            const rawPlug = new (rawPlugs[rawPlugKey])();
            //set config
            rawPlug.config = config;
            //check for plugCode
            if (rawPlug.plugCode === FireJSXPlugin_1.PluginCode.PagePlugin) {
                //check ver
                checkVer(rawPlug, PagePlugin_1.PagePlugMinVer, rawPlugKey, pluginPath);
                //pass params
                managePagePlugin(rawPlug, pluginPath, {
                    pageMap
                });
            }
            else if (rawPlug.plugCode === FireJSXPlugin_1.PluginCode.GlobalPlugin) {
                //check ver
                checkVer(rawPlug, GlobalPlugin_1.GlobalPlugMinVer, rawPlugKey, pluginPath);
                //pass params
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
function managePagePlugin(plugin, pluginFile, { pageMap }) {
    const page = pageMap.get(plugin.page);
    if (page)
        page.plugin = plugin;
    else
        throw new Error(`Page ${plugin.page} requested by PagePlugin ${pluginFile} does not exist`);
}
function manageGlobalPlugin(plugin, pluginFile, { webpackArchitect, globalPlugins }) {
    if (webpackArchitect)
        plugin.initWebpack(webpackArchitect.defaultConfig);
    globalPlugins.push(plugin);
}
