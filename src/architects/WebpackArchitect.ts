import {$, WebpackConfig} from "../FireJSX"
import {join, relative} from "path"
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'

export default class {
    private readonly $: $;
    public readonly config: WebpackConfig;
    public readonly proOrSSR: boolean

    constructor($: $) {
        this.$ = $;
        this.proOrSSR = $.ssr || $.pro
        this.config = {
            target: 'web',
            mode: process.env.NODE_ENV as "development" | "production" | "none",
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
                filename: `m.${this.proOrSSR ? "[contenthash]" : "[id][fullhash]"}.js`,
                chunkFilename: "c.[contenthash].js",
                publicPath: `${this.$.prefix}/${this.$.lib}/`,
                path: `${this.$.outDir}/${this.$.lib}/`,
                globalObject: 'window',
                //hot
                hotUpdateMainFilename: `h.${this.$.lib}/[fullhash][id].hot.json`,
                hotUpdateChunkFilename: `h.${this.$.lib}/[fullhash][id].hot.js`
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
                                cacheDirectory: join(this.$.cacheDir, "babelCache"),
                                presets: [["@babel/preset-env", {
                                    loose: true,
                                    targets: {
                                        browsers: [`last 2 versions`, `not ie <= 11`, `not android 4.4.3`],
                                    },
                                }], "@babel/preset-react"],
                                plugins: ["@babel/plugin-syntax-dynamic-import", "@babel/plugin-transform-runtime",
                                    ...(this.proOrSSR ? [] : [])]
                            }
                        }
                    ]
                },
                    {
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
                    }]
            },
            plugins: [
                new MiniCssExtractPlugin({
                    filename: "cs.[contenthash].css",
                    chunkFilename: "cs.[contenthash].css"
                }),
                ...(this.proOrSSR ? [] : [
                    /*new webpack.HotModuleReplacementPlugin({
                        multiStep: true
                    }),
                    new CleanWebpackPlugin({
                        verbose: this.$.verbose,
                        cleanOnceBeforeBuildPatterns: ['**!/!*', '!map/!*', '!e.*'],
                    })*/
                ])
            ],
            resolve: {
                extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx']
            }
        }
    }

    forExternals(): WebpackConfig {
        const conf: WebpackConfig = {
            target: 'web',
            mode: process.env.NODE_ENV as "development" | "production" | "none",
            entry: {
                e: join(__dirname, "../web/externalGroupSemi.js")
            },
            output: {
                path: `${this.$.outDir}/${this.$.lib}/`,
                filename: "[name].[contenthash].js"
            }
        }
        //only create full when ssr
        if (this.$.ssr)
            conf.entry[join(relative(`${this.$.outDir}/${this.$.lib}/`, this.$.cacheDir), "f")] = join(__dirname, "../web/externalGroupFull.js")
        return conf;
    }

    forPages(): WebpackConfig {
        this.$.pageMap.forEach(page => {
            this.config.entry[page.toString()] = [
                join(this.$.pages, page.toString()),
                join(__dirname, "../web/Wrap.js")
                /*...(this.proOrSSR ? [] : [
                    `webpack-hot-middleware/client?path=/__webpack_hmr&reload=true&quiet=true`])*/
            ]
        })
        this.$.hooks.initWebpack.forEach(initWebpack => initWebpack(this.config))
        return this.config;
    }
}
