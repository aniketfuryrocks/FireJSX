import {cloneDeep} from "lodash"
import {$, WebpackConfig} from "../FireJSX"
import {join, relative} from "path"
import Page from "../classes/Page"
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as CleanObsoleteChunks from 'webpack-clean-obsolete-chunks'
import * as webpack from "webpack";

export default class {
    private readonly $: $;
    public readonly defaultConfig: WebpackConfig;

    constructor($: $) {
        this.$ = $;
        this.defaultConfig = {
            target: 'web',
            mode: process.env.NODE_ENV as "development" | "production" | "none",
            optimization: {
                splitChunks: {
                    chunks: 'all',
                    minChunks: Infinity
                },
                usedExports: true,
                minimize: true
            },
            entry: [],
            output: {
                filename: `m[${this.$.config.pro ? "chunkhash" : "hash"}].js`,
                chunkFilename: "c[contentHash].js",
                publicPath: `/${this.$.rel.libRel}/`,
                path: this.$.config.paths.lib,
                hotUpdateMainFilename: 'hot/[hash].hot.json',
                hotUpdateChunkFilename: 'hot/[hash].hot.js'
            },
            module: {
                rules: [{
                    test: /\.(js|jsx)$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: join(this.$.config.paths.cache, ".babelCache"),
                            presets: [["@babel/preset-env", {
                                loose: true,
                                targets: {
                                    browsers: [`last 2 versions`, `not ie <= 11`, `not android 4.4.3`],
                                },
                            }], "@babel/preset-react"],
                            plugins: ["@babel/plugin-syntax-dynamic-import", "@babel/plugin-transform-runtime", "react-hot-loader/babel"]
                        }
                    },
                }, {
                    test: /\.css$/i,
                    use: [
                        ...(this.$.config.pro ? [MiniCssExtractPlugin.loader] : ['style-loader']),
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    hashPrefix: 'hash',
                                },
                            },
                        }]
                }]
            },
            externals: {
                react: "React",
                "react-dom": 'ReactDOM'
            },
            plugins: [
                ...(this.$.config.pro ? [new MiniCssExtractPlugin({
                    filename: "c[contentHash].css"
                })] : [new webpack.HotModuleReplacementPlugin({
                    multiStep: true
                })]),
                new CleanObsoleteChunks({
                    verbose: this.$.config.verbose
                })
            ]
        }
    }

    forExternals(): WebpackConfig {
        const conf: WebpackConfig = {
            target: 'web',
            mode: process.env.NODE_ENV as "development" | "production" | "none",
            entry: {
                "e": join(__dirname, "../web/external_group_semi.js"),
                "r": join(__dirname, "../web/renderer.js"),
            },
            resolve: {
                alias: {
                    'react-dom': '@hot-loader/react-dom',
                },
            },
            output: {
                path: this.$.config.paths.lib,
                filename: "[name][contentHash].js"
            }
        };
        conf.entry[join(relative(this.$.config.paths.lib, this.$.config.paths.cache), "f")] = join(__dirname, "../web/external_group_full.js");
        return conf;
    }

    forPage(page: Page): WebpackConfig {
        const mergedConfig = cloneDeep(this.defaultConfig);
        mergedConfig.name = page.toString()
        if (this.$.config.pro)
            mergedConfig.entry = join(__dirname, "../web/wrapper_pro.js");
        else
            mergedConfig.entry = [`webpack-hot-middleware/client?path=/__webpack_hmr_/${mergedConfig.name}&reload=true&quiet=true&name=${mergedConfig.name}`, join(__dirname, "../web/wrapper.js")];
        mergedConfig.plugins.push(new webpack.ProvidePlugin({
            __FIREJSX_APP__: join(this.$.config.paths.pages, mergedConfig.name)
        }))
        page.plugin.initWebpack(mergedConfig);
        return mergedConfig;
    }
}