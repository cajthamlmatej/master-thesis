import moment from "moment";

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
    slides: Slide[];

    constructor(id: string, createdAt: Date, updatedAt: Date, name: string, slides: {
        id: string;
        data: string;
        thumbnail: string | undefined;
        position: number;
    }[]) {
        this.id = id;
        this.createdAt = moment(createdAt);
        this.updatedAt = moment(updatedAt);
        this.name = name;
        this.slides = slides.map(slide => new Slide(slide.id, slide.data, slide.thumbnail, slide.position));
    }

}
