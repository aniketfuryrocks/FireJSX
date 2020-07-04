import PagePlugin from "../plugins/PagePlugin";
export default class {
    chunks: string[];
    plugin: PagePlugin;
    private readonly name;
    constructor(page: string);
    toString(): string;
}
