import moment from "moment";

export class PluginRelease {
    version: string;
    date: moment.Moment;
    changelog: string;
    manifest: string;
    editorCode: string;
    playerCode: string;
}

export default class Plugin {
    author: string;
    id: string;
    name: string;
    icon: string;
    description: string;
    tags: string[];
    releases: PluginRelease[];

    constructor(author: string, id: string, name: string, icon: string, description: string, tags: string[], releases: PluginRelease[]) {
        this.author = author;
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.tags = tags;
        this.releases = releases;
    }

}
