import PagePlugin from "../plugins/PagePlugin";

export default class {
    public chunks: string[] = [];
    public plugin: PagePlugin;
    private readonly name: string;

    constructor(page: string) {
        this.name = page;
        // @ts-ignore
        this.plugin = new PagePlugin(this.name);
    }

    toString(): string {
        return this.name;
    }
}