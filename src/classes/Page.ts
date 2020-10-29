import {PageHooks} from "../types/Plugin";
import {PageChunks} from "../types/global";

export default class {
    public hooks: PageHooks;
    private readonly name: string;
    public chunks: PageChunks;

    constructor(page: string) {
        this.name = page;
        this.hooks = {
            postRender: [],
            onBuild: []
        }
        this.chunks = {
            initial: [],
            async: []
        }
    }

    toString(): string {
        return this.name;
    }
}
