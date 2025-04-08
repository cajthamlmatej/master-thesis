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

        if(lastManifest) {
            try {
                this.lastManifest = JSON.parse(lastManifest);
            } catch (e) {
                this.lastManifest = {
                    manifest: "",
                    allowedOrigins: []
                };
            }
        } else {
            if(this.releases.length === 0) {
                this.lastManifest = {
                    manifest: "",
                    allowedOrigins: []
                };
            }  else {
                this.lastManifest = JSON.parse(this.releases[0].manifest);
            }
        }


        if(this.lastReleaseDate) {
            this.lastReleaseDate = moment(lastReleaseDate);
        } else {
            if(this.releases.length === 0) {
                this.lastReleaseDate = moment();
            } else {
                this.lastReleaseDate = this.releases[0].date;
            }
        }
    }

    sortedReleases() {
        return this.releases.sort((a, b) => b.date.diff(a.date));
    }

    lastRelease() {
        if(this.releases.length === 0) {
            return undefined;
        }

        return this.sortedReleases()[0];
    }

    requiresUserAttention() {
        return this.lastManifest && this.lastManifest.allowedOrigins && this.lastManifest.allowedOrigins.length !== 0;
    }

}
