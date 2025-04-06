export class EditorAttendee {
    public id: string;
    public name: string;
    public color: string;

    public icon: string;

    public slideId: string;
    public selectedBlocks: string[] = [];

    constructor(id: string, name: string, color: string, slideId: string, selectedBlocks: string[] = []) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.slideId = slideId;
        this.icon = name[0].toUpperCase() ?? "-";
        this.selectedBlocks = selectedBlocks;
    }
}
