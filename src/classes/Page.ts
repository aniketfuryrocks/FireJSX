import {PageHooks} from "../types/Plugin";
import {PageChunks} from "../types/global";

export default class {
    public hooks: PageHooks;
    public chunks: PageChunks;
    private readonly name: string;

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
