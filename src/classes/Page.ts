import {PageHooks} from "../types/Plugin";

export default class {
    public chunks: string[] = []
    public hooks: PageHooks;
    private readonly name: string;

    constructor(page: string) {
        this.name = page;
        this.hooks = {
            initWebpack: [],
            postRender: [],
            onBuild: []
        }
    }

    toString(): string {
        return this.name;
    }
}