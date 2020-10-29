import {PageChunks} from "../types/global";

export default class {
    public chunks: PageChunks;

    constructor() {
        this.chunks = {
            initial: [],
            entry: [],
            async: []
        }
    }
}
