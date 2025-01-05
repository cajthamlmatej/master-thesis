export default class Slide {
    id: string;
    content: string;
    thumbnail: string | undefined;
    position: number;

    constructor(id: string, content: string, thumbnail: string | undefined, position: number) {
        this.id = id;
        this.content = content;
        this.thumbnail = thumbnail;
        this.position = position;
    }

}
