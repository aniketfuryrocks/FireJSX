import {$, WebpackConfig} from "../index"
import {join} from "path"
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as webpack from "webpack";
import {RuleSetRule, RuleSetUseItem} from "webpack";
import {CleanWebpackPlugin} from "clean-webpack-plugin";

const resolve_extensions = ['.wasm', '.mjs', '.js', '.json', '.jsx'];
const externals = {
    react: "React",
    "react-dom": 'ReactDOM'
}

function generateMiniCssExtractPlugin() {
    return new MiniCssExtractPlugin({
        filename: "cs.[contenthash].css",
        chunkFilename: "cs.[contenthash].css"
    })
}

export default class {
    private readonly $: $;
    public readonly proOrSSR: boolean

    constructor($: $) {
        this.$ = $;
        this.proOrSSR = $.ssr || $.pro
    }

    generateCssRule(): RuleSetRule {
        return {
            test: /\.css$/,
            use: [
                ...(this.proOrSSR ? [MiniCssExtractPlugin.loader] : ['style-loader']),
                {
                    loader: 'css-loader',
                    options: {
                        modules: true
                    },
                },
            ]
        }
    }

    generateBabelRuleSetUseItem(): RuleSetUseItem {
        return {
            loader: 'babel-loader',
            options: {
                sourceType: 'unambiguous',
                cacheDirectory: join(this.$.cacheDir, "babelCache"),
                presets: [["@babel/preset-env", {
                    modules: false,
                    targets: {
                        browsers: [`last 2 versions`, `not ie <= 11`, `not android 4.4.3`],
                    },
                }], "@babel/preset-react"],
                plugins: ["@babel/plugin-syntax-dynamic-import", "@babel/plugin-transform-runtime",
                    "@babel/plugin-transform-modules-commonjs"]
            }
        }
    }

    forApp(): WebpackConfig {
        return {
            target: 'web',
            mode: process.env.NODE_ENV as "development" | "production" | "none",
            watch: !this.$.ssr, //no watch when ssr
            entry: this.$.app,
            externals,
            output: {
                path: `${this.$.outDir}/${this.$.lib}/`,
                publicPath: `${this.$.prefix}/${this.$.lib}/`,
                filename: "a.[contenthash].js",
                globalObject: 'FireJSX',
                jsonpFunction: 'appJsonp',
            },
            plugins: [
                generateMiniCssExtractPlugin()
            ],
            module: {
                rules: [
                    {
                        test: /\.(jsx)$/,
                        use: this.generateBabelRuleSetUseItem()
                    },
                    this.generateCssRule()
                ]
            },
            resolve: {
                extensions: resolve_extensions
            }
        }
    }

    forPages(): WebpackConfig {
        const config: WebpackConfig = {
            target: 'web',
            mode: process.env.NODE_ENV as "development" | "production" | "none",
            watch: !this.$.ssr, //no watch when ssr
            optimization: {
                sideEffects: false,
                minimize: true,
                runtimeChunk: "single",
                usedExports: true,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            enforce: true
                        }
                    }
                }
            },
            entry: {},
            output: {
                filename: `m.${this.proOrSSR ? "[contenthash]" : "[id][hash]"}.js`,
                chunkFilename: "c.[contenthash].js",
                publicPath: `${this.$.prefix}/${this.$.lib}/`,
                path: `${this.$.outDir}/${this.$.lib}/`,
                globalObject: 'FireJSX',
                jsonpFunction: 'pagesJsonp',
                hotUpdateMainFilename: `h[hash].hot.json`,
                hotUpdateChunkFilename: `h[hash].hot.js`
            },
            externals,
            module: {
                rules: [{
                    test: /\.(js|jsx)$/,
                    use: [
                        (() => {
                            const babelLoader: any = this.generateBabelRuleSetUseItem();
                            if (this.proOrSSR)
                                babelLoader.options.plugins.push("react-hot-loader/babel")
                            return babelLoader
                        })(), {//adds wrapper to App function
                            loader: join(__dirname, '../loader/wrapper.js'),
                            options: {
                                pages_path: this.$.pages,
                                proOrSSR: this.proOrSSR
                            }
                        }
                    ]
                }, this.generateCssRule()]
            },
            plugins: [
                generateMiniCssExtractPlugin(),
                ...(this.proOrSSR ? [] : [
                    new webpack.HotModuleReplacementPlugin({
                        multiStep: true
                    }),
                    new CleanWebpackPlugin({
                        verbose: this.$.verbose,
                        cleanOnceBeforeBuildPatterns: ['**/*', '!map/!*', '!e.*', '!a.*'],
                    })
                ])
            ],
            resolve: {
                extensions: resolve_extensions
            }
        };

        this.$.pageMap.forEach(page => {
            config.entry[page.toString()] = [
                join(this.$.pages, page.toString()),
                ...(this.proOrSSR ? [] : [
                    `webpack-hot-middleware/client?path=/__webpack_hmr&reload=true&quiet=true`])
            ]
        })
        this.$.hooks.initWebpack.forEach(initWebpack => initWebpack(config))
        return config;
    }

    forSemiExternal(): WebpackConfig {
        return {
            target: 'web',
            mode: process.env.NODE_ENV as "development" | "production" | "none",
            entry: [
                ...(this.proOrSSR ? [] : ['react-hot-loader/patch']),
                join(__dirname, "../web/externalGroupSemi")
            ],
            output: {
                path: `${this.$.outDir}/${this.$.lib}/`,
                filename: "e.[contenthash].js",
                globalObject: 'window'
            },
            resolve: {
                alias: (this.proOrSSR ? {} : {
                    'react-dom': '@hot-loader/react-dom',
                })
            }
        }
    }

    forFullExternal(): WebpackConfig {
        return {
            target: 'node',
            mode: process.env.NODE_ENV as "development" | "production" | "none",
            entry: join(__dirname, "../web/externalGroupFull"),
            output: {
                path: this.$.cacheDir,
                filename: "f.[contenthash].js",
                globalObject: 'global'
            }
        }
    }
}
