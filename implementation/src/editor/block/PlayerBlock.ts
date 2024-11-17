import type Player from "@/editor/player/Player";

export abstract class PlayerBlock {
    public id: string;
    public type: string;
    public position: {
        x: number;
        y: number;
    }
    public size: {
        width: number;
        height: number;
    }
    public rotation: number = 0;
    public zIndex: number = 0;

    public element!: HTMLElement;
    public player!: Player;

    protected constructor(id: string, type: string, position: { x: number, y: number }, size: { width: number, height: number }, rotation: number, zIndex: number) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.size = size;
        this.rotation = rotation;
        this.zIndex = zIndex;
    }

    /**
     * Renders the block element for the first time for the editor in the DOM.
     */
    public abstract render(): HTMLElement;

    public synchronize() {
        if (!this.element) return;

        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";

        this.element.style.width = this.size.width + "px";
        this.element.style.height = this.size.height + "px";

        this.element.style.transform = `rotate(${this.rotation}deg)`;
        this.element.style.zIndex = this.zIndex.toString();
    }

    public setPlayer(player: Player) {
        if (this.player) {
            throw new Error("Block already has an player.");
        }

        this.player = player;
    }

}
