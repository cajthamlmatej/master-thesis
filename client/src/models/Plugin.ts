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

    readonly lastManifest: {
        manifest: string;
        allowedOrigins: string[]
    };
    readonly lastReleaseDate: moment.Moment;

    constructor(author: string, id: string, name: string, icon: string, description: string, tags: string[], releases: PluginRelease[], lastManifest?: string, lastReleaseDate?: string) {
        this.author = author;
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.tags = tags;
        this.releases = releases;

        this.lastManifest = JSON.parse(lastManifest ? lastManifest : this.sortedReleases()[0].manifest);
        this.lastReleaseDate = lastReleaseDate ? moment(lastReleaseDate) : this.sortedReleases()[0].date;
    }

    sortedReleases() {
        return this.releases.sort((a, b) => b.date.diff(a.date));
    }

}
