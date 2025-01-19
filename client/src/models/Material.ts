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
}

export default class Material {
    id: string;
    createdAt: moment.Moment;
    name: string;
    slides: Slide[];

    constructor(id: string, createdAt: Date, name: string, slides: Slide[]) {
        this.id = id;
        this.createdAt = moment(createdAt);
        this.name = name;
        this.slides = slides;
    }

}
