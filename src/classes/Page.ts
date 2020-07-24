import {PageHooks} from "../types/Plugin";

export default class {
    public chunks: PageChunks;
    public hooks: PageHooks;
    private readonly name: string;
    public app
    constructor(page: string) {
        this.name = page;
        this.hooks = {
            postRender: [],
            onBuild: []
        }
        this.chunks = {
            initial: [],
            entry: [],
            async: []
        }
    }

    toString(): string {
        return this.name;
    }
}