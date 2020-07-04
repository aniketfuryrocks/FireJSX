"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const path_1 = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanObsoleteChunks = require("webpack-clean-obsolete-chunks");
const webpack = require("webpack");
class default_1 {
    constructor($) {
        this.$ = $;
        this.defaultConfig = {
            target: 'web',
            mode: process.env.NODE_ENV,
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
                                cacheDirectory: path_1.join(this.$.config.paths.cache, ".babelCache"),
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
                        test: /\.(js|jsx)$/,
                        use: 'react-hot-loader/webpack',
                        include: /node_modules/
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
                            }
                        ]
                    }]
            },
            externals: {
                react: "React",
                "react-dom": 'ReactDOM'
            },
            plugins: [
                ...(this.$.config.pro ? [new MiniCssExtractPlugin({
                        filename: "c[contentHash].css"
                    })] : [
                    new webpack.HotModuleReplacementPlugin({
                        multiStep: true
                    })
                ]),
                new CleanObsoleteChunks({
                    verbose: this.$.config.verbose
                })
            ]
        };
    }
    forExternals() {
        const conf = {
            target: 'web',
            mode: process.env.NODE_ENV,
            entry: {
                "e": path_1.join(__dirname, "../web/external_group_semi.js"),
                "r": path_1.join(__dirname, "../web/renderer.js"),
            },
            output: {
                path: this.$.config.paths.lib,
                filename: "[name][contentHash].js"
            }
        };
        conf.entry[path_1.join(path_1.relative(this.$.config.paths.lib, this.$.config.paths.cache), "f")] = path_1.join(__dirname, "../web/external_group_full.js");
        return conf;
    }
    forPage(page) {
        const mergedConfig = lodash_1.cloneDeep(this.defaultConfig);
        mergedConfig.name = page.toString();
        mergedConfig.entry = [
            ...(this.$.config.pro ? [] : [`webpack-hot-middleware/client?path=/__webpack_hmr_/${mergedConfig.name}&reload=true&quiet=true&name=${mergedConfig.name}`]),
            path_1.join(__dirname, "../web/wrapper.js")
        ];
        mergedConfig.plugins.push(new webpack.ProvidePlugin({
            __FIREJSX_APP__: path_1.join(this.$.config.paths.pages, mergedConfig.name)
        }));
        page.plugin.initWebpack(mergedConfig);
        return mergedConfig;
    }
}
exports.default = default_1;
