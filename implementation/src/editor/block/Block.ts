import type {BlockType} from "@/editor/block/BlockType";
import type Editor from "@/editor/Editor";

export abstract class Block {
    public id: string;
    public type: BlockType;
    public position: {
        x: number;
        y: number;
    }
    public size: {
        width: number;
        height: number;
    }
    public rotation: number = 0;

    public element!: HTMLElement;
    public editor!: Editor;

    protected constructor(id: string, type: BlockType, position: {x: number, y: number}, size: {width: number, height: number}) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.size = size;
    }

    /**
     * Renders the block element for the first time for the editor in the DOM.
     */
    abstract render(): HTMLElement;
    public abstract editorSupport(): {
        selection: boolean;
        movement: boolean;
        proportionalResizing: boolean;
        nonProportionalResizingX: boolean;
        nonProportionalResizingY: boolean;
        rotation: boolean;
    }
    public abstract getContent(): HTMLElement | undefined;


    /**
     * Called when the block is mounted in the DOM.
     */
    public onMounted() {
        // To be implemented by subclasses
    }

    /**
     * Called when the block is selected.
     */
    public onSelected() {
        this.element.classList.add("block--selected");
    }

    /**
     * Called when the block is deselected.
     */
    public onDeselected() {
        this.element.classList.remove("block--selected");
    }

    /**
     * Called when the block is done being resized.
     * @param type
     * @param start The starting width and height of the block.
     */
    public onResizeCompleted(type: 'PROPORTIONAL' | 'NON_PROPORTIONAL', start: {
        width: number;
        height: number;
    }) {
        // To be implemented by subclasses
    }

    /**
     * Called when the block is done being moved.
     * @param start The starting position of the block.
     */
    public onMovementCompleted(start: {
        x: number;
        y: number;
    }) {
        // To be implemented by subclasses
    }

    /**
     * Called when the block is done being rotated.
     * @param start The starting rotation of the block.
     */
    public onRotationCompleted(start: number) {
        // To be implemented by subclasses
    }



    public setEditor(editor: Editor) {
        if (this.editor) {
            throw new Error("Block already has an editor.");
        }

        this.editor = editor;
    }

    public move(x: number, y: number) {
        this.position.x = x;
        this.position.y = y;

        this.synchronize();
    }
    public rotate(rotation: number) {
        this.rotation = rotation;

        this.synchronize();
    }

    public overlaps(range: {top: number, right: number, bottom: number, left: number}) {
        return this.position.x < range.right && this.position.x + this.size.width > range.left && this.position.y < range.bottom && this.position.y + this.size.height > range.top;
    }



    /**
     * Synchronizes the block element in DOM with the block properties.
     */
    public synchronize() {
        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";

        this.element.style.width = this.size.width + "px";
        this.element.style.height = this.size.height + "px";

        this.element.style.transform = `rotate(${this.rotation}deg)`;
    }

    /**
     * Matches the width of the block with the rendered width of the block element.
     */
    public matchRenderedHeight() {
        this.size.height = this.element.clientHeight;

        if(this.getContent()) {
            this.size.height = this.getContent()!.clientHeight;
        }

        this.synchronize();
    }
}
