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

export default class Material {
    id: string;
    createdAt: moment.Moment;
    updatedAt: moment.Moment;
    name: string;
    visibility: MaterialVisibility;
    method: MaterialMethod;
    automaticTime: number;
    sizing: MaterialSizing;
    slides: Slide[];
    thumbnail?: string;

    constructor(id: string, createdAt: Date, updatedAt: Date, name: string, slides: {
                    id: string;
                    data: string;
                    thumbnail: string | undefined;
                    position: number;
                }[],
                visibility: MaterialVisibility, method: MaterialMethod, automaticTime: number, sizing: MaterialSizing,
                thumbnail?: string) {
        this.id = id;
        this.createdAt = moment(createdAt);
        this.updatedAt = moment(updatedAt);
        this.name = name;
        this.visibility = visibility;
        this.method = method;
        this.automaticTime = automaticTime;
        this.sizing = sizing;
        this.slides = slides.map(slide => new Slide(slide.id, slide.data, slide.thumbnail, slide.position));

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
