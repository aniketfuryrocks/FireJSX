import {PageHooks} from "../types/Plugin";
import AppPage from "./AppPage";

export default class extends AppPage {
    public hooks: PageHooks;
    private readonly name: string;

    constructor(page: string) {
        super();
        this.name = page;
        this.hooks = {
            postRender: [],
            onBuild: []
        }
    }
    toString(): string {
        return this.name;
    }
}
