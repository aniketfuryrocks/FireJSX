import {$, WebpackConfig} from "../FireJSX"
import {join, relative} from "path"
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as CleanObsoleteChunks from 'webpack-clean-obsolete-chunks'
import * as webpack from "webpack";

export default class {
    private readonly $: $;
    public readonly config: WebpackConfig;

    constructor($: $) {
        this.$ = $;
        this.config = {
            target: 'web',
            mode: process.env.NODE_ENV as "development" | "production" | "none",
            optimization: {
                minimize: true,
                runtimeChunk: "single",
                splitChunks: {
                    chunks: 'all',
                    maxInitialRequests: Infinity,
                    minSize: 0,
                    cacheGroups: {
                        framework: {
                            chunks: 'all',
                            name: 'framework',
                            test: /(?<!node_modules.*)[\\/]node_modules[\\/](|webpack|babel|prop-types|css-loader|use-subscription|react-side-effect|react-helmet|style-loader|)[\\/]/,
                            priority: 40,
                        },
                        vendor: {
                            chunks: 'all',
                            test: /[\\/]node_modules[\\/]/,
                            name(module) {
                                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                                return `npm.${packageName.replace('@', '')}`;
                            },
                        },
                        lazy: {
                            chunks: 'async',
                            test: new RegExp(this.$.config.paths.src),
                            priority: 100,
                            name(module) {
                                const packageName = module.context.match(new RegExp(this.$.config.paths.src + "(.*?)([\\/]|$)"))[1];
                                return `async.${packageName.replace('@', '')}`;
                            },
                        }
                    },
                }
            },
            entry: {},
            output: {
                filename: `m[${this.$.pro ? "contenthash" : "hash"}].js`,
                chunkFilename: "c[contenthash].js",
                publicPath: this.$.config.lib + "/",
                path: this.$.config.dist,
                //hot
                hotUpdateMainFilename: 'hot/[hash].hot.json',
                hotUpdateChunkFilename: 'hot/[hash].hot.js'
            },
            externals: {
                react: "React",
                "react-dom": 'ReactDOM',
            },
            module: {
                rules: [{
                    test: /\.(js|jsx)$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: join(this.$.config.paths.cache, ".babelCache"),
                                presets: [["@babel/preset-env", {
                                    loose: true,
                                    targets: {
                                        browsers: [`last 2 versions`, `not ie <= 11`, `not android 4.4.3`],
                                    },
                                }], "@babel/preset-react"],
                                plugins: ["@babel/plugin-syntax-dynamic-import", "@babel/plugin-transform-runtime",
                                    ...(this.$.config.pro ? [] : ["react-hot-loader/babel"])]
                            }
                        }
                    ]
                },
                    {
                        test: /\.css$/,
                        use: [
                            ...(this.$.config.pro ? [MiniCssExtractPlugin.loader] : ['style-loader']),
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: {
                                        hashPrefix: 'hash',
                                    },
                                },
                            },
                        ]
                    }]
            },
            plugins: [
                new MiniCssExtractPlugin({
                    filename: "c[contentHash].css",
                    chunkFilename: "c[contentHash].css"
                }),
                ...(this.$.config.pro ? [] : [
                    new webpack.HotModuleReplacementPlugin({
                        multiStep: true
                    }),
                    new CleanObsoleteChunks({
                        verbose: this.$.config.verbose
                    })
                ])
            ],
            resolve: {
                alias: (this.$.config.pro ? {} : {'firejsx/Hot': 'react-hot-loader/root'}),
            }
        }
    }

    forExternals(): WebpackConfig {
        const conf: WebpackConfig = {
            target: 'web',
            mode: process.env.NODE_ENV as "development" | "production" | "none",
            entry: {
                "e": [
                    ...(this.$.config.pro ? [] : ['react-hot-loader/patch']),
                    join(__dirname, "../web/externalGroupSemi.js")
                ]
            },
            output: {
                path: this.$.config.paths.lib,
                filename: "[name][contentHash].js"
            },
            resolve: {
                alias: (this.$.config.pro ? {} : {
                    'react-dom': '@hot-loader/react-dom',
                })
            }
        }
        conf.entry[join(relative(this.$.config.paths.lib, this.$.config.paths.cache), "f")] = join(__dirname, "../web/externalGroupFull.js")
        return conf;
    }

    forPages(): WebpackConfig {
        this.$.pageMap.forEach(page => {
            this.config.entry[page.toString()] = [
                join(this.$.config.paths.pages, page.toString()),
                ...(this.$.config.pro ? [] : [
                    `webpack-hot-middleware/client?path=/__webpack_hmr&reload=true&quiet=true`]),
            ]
        })
        this.$.hooks.initWebpack.forEach(initWebpack => initWebpack(this.config))
        return this.config;
    }
}