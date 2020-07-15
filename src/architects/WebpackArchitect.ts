import {$, WebpackConfig} from "../FireJSX"
import {join} from "path"
import Page from "../classes/Page"
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
                runtimeChunk: 'single',
                splitChunks: {
                    chunks: 'all',
                    maxInitialRequests: Infinity,
                    minSize: 0,
                    cacheGroups: {
                        default: false,
                        framework: {
                            chunks: 'all',
                            name: 'framework',
                            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|regenerator-runtime|react-fast-compare|webpack|babel|prop-types|css-loader|use-subscription|react-side-effect|react-helmet|style-loader|)[\\/]/,
                            priority: 40,
                            enforce: true,
                        },
                        vendor: {
                            chunks: 'all',
                            test: /[\\/]node_modules[\\/]/,
                            name(module) {
                                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                                return `npm.${packageName.replace('@', '')}`;
                            },
                            enforce: true
                        },
                        lazy:{
                            chunks: 'async',
                            test: /[\\/]test\/components[\\/]/,
                            priority: 100,
                            name(module) {
                                const packageName = module.context.match(/[\\/]test\/components[\\/](.*?)([\\/]|$)/)[1];
                                return `async.${packageName.replace('@', '')}`;
                            },
                            enforce: true
                        }
                    },
                },
                usedExports: true,
                minimize: true
            },
            entry: {},
            output: {
                filename: `m[${this.$.config.pro ? "contenthash" : "hash"}].js`,
                chunkFilename: "c[contenthash].js",
                publicPath: this.$.rel.libRel + "/",
                path: this.$.config.paths.lib,
                //lib
                library: '__FIREJSX_APP__',
                libraryTarget: 'window',
                //hot
                hotUpdateMainFilename: 'hot/[hash].hot.json',
                hotUpdateChunkFilename: 'hot/[hash].hot.js'
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
                    new webpack.HotModuleReplacementPlugin(),
                    new CleanObsoleteChunks({
                        verbose: this.$.config.verbose
                    })
                ]),
            ]
        }
    }

    forPages(pages: Page[]): WebpackConfig {
        pages.forEach(page => {
            const pagePath = join(this.$.config.paths.pages, page.toString())
            if (this.$.config.pro)
                this.config.entry[page.toString()] = [pagePath]
            else
                this.config.entry[page.toString()] = [pagePath,
                    `webpack-hot-middleware/client?path=/__webpack_hmr/${page.toString()}&reload=true&quiet=true&name=${page.toString()}`]
            page.hooks.initWebpack.forEach(initWebpack => initWebpack(this.config));
        })
        this.$.hooks.initWebpack.forEach(initWebpack => initWebpack(this.config))
        console.log(this.config)
        return this.config;
    }
}