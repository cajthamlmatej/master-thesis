import moment from "moment";
import {MaterialMethod, MaterialSizing, MaterialVisibility} from "../../lib/dto/material/MaterialEnums";

export class Slide {
    id: string;
    data: string;
    thumbnail: string | undefined;
    position: number;

    constructor(id: string, data: string, thumbnail: string | undefined, position: number) {
        this.id = id;
        this.data = data;
        this.thumbnail = thumbnail;
        this.position = position;
    }

    parseData() {
        return JSON.parse(this.data);
    }

    getSize() {
        return this.parseData().editor.size;
    }
}

export class MaterialPlugin {
    plugin: string;
    release: string;

    constructor(plugin: string, release: string) {
        this.plugin = plugin;
        this.release = release;
    }
}

export default class Material {
    id: string;
    createdAt: moment.Moment;
    updatedAt: moment.Moment;
    plugins: MaterialPlugin[] = [];
    name: string;
    visibility: MaterialVisibility;
    method: MaterialMethod;
    automaticTime: number;
    sizing: MaterialSizing;
    slides: Slide[];
    user: string;
    thumbnail?: string;

    constructor(id: string, createdAt: Date, updatedAt: Date, name: string, slides: {
                    id: string;
                    data: string;
                    thumbnail: string | undefined;
                    position: number;
                }[],
                plugins: {
                    plugin: string;
                    release: string;
                }[],
                visibility: MaterialVisibility, method: MaterialMethod, automaticTime: number, sizing: MaterialSizing,
                user?: string,
                thumbnail?: string) {
        this.id = id;
        this.createdAt = moment(createdAt);
        this.updatedAt = moment(updatedAt);
        this.name = name;
        this.visibility = visibility;
        this.method = method;
        this.automaticTime = automaticTime;
        this.sizing = sizing;
        this.user = user || "";
        this.slides = slides.map(slide => new Slide(slide.id, slide.data, slide.thumbnail, slide.position));
        this.plugins = plugins.map(plugin => new MaterialPlugin(plugin.plugin, plugin.release));

        if (thumbnail) {
            this.thumbnail = thumbnail;
        } else {
            if (this.slides.length === 0) {
                this.thumbnail = undefined;
                return;
            }

            this.thumbnail = this.slides[0].thumbnail;
        }
    }

}
