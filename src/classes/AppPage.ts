import {appPageChunks} from "../types/global";

export default class {
    public chunks: appPageChunks;

    constructor() {
        this.chunks = {
            initial: [],
            runtime: "",
            async: []
        }
    }
}
