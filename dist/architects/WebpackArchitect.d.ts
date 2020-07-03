import { $, WebpackConfig } from "../FireJSX";
import Page from "../classes/Page";
export default class {
    private readonly $;
    readonly defaultConfig: WebpackConfig;
    constructor($: $);
    forExternals(): WebpackConfig;
    forPage(page: Page): WebpackConfig;
}
