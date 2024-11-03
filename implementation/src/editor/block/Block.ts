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

    public selected: boolean = false;
    public resizing: boolean = false;
    public moving: boolean = false;
    public rotating: boolean = false;

    protected constructor(id: string, type: BlockType, position: { x: number, y: number }, size: { width: number, height: number }) {
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

    /**
     * After editorSupport() has been called, this method can be used to check if the block can currently do a certain action.
     * The element could be in a state, that doesnt allow the action to be performed.
     * @param action
     */
    public canCurrentlyDo(action: 'select' | 'move' | 'resize' | 'rotate') {
        return true;
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
        this.selected = true;
        // To be implemented by subclasses
    }

    /**
     * Called when the block is deselected.
     */
    public onDeselected() {
        this.element.classList.remove("block--selected");
        this.selected = false;
    }

    public onResizeStarted() {
        this.resizing = true;
    }

    /**
     * Called when the block is done being resized.
     * @param type
     * @param start The starting width and height of the block.
     */
    public onResizeCompleted(type: 'PROPORTIONAL' | 'NON_PROPORTIONAL', start: { width: number; height: number; }) {
        // To be implemented by subclasses
        this.resizing = false;
    }

    public onMovementStarted() {
        this.moving = true;
    }

    /**
     * Called when the block is done being moved.
     * @param start The starting position of the block.
     */
    public onMovementCompleted(start: { x: number; y: number; }) {
        // To be implemented by subclasses
        this.moving = false;
    }

    public onRotationStarted() {
        this.rotating = true;
    }

    /**
     * Called when the block is done being rotated.
     * @param start The starting rotation of the block.
     */
    public onRotationCompleted(start: number) {
        // To be implemented by subclasses
        this.rotating = false;
    }

    /**
     * Is called when the block is clicked while it is selected.
     * @param event The mouse event that triggered the click.
     */
    public onClicked(event: MouseEvent) {
        // To be implemented by subclasses
    }


    public setEditor(editor: Editor) {
        if (this.editor) {
            throw new Error("Block already has an editor.");
        }

        this.editor = editor;
    }

    public move(x: number, y: number, skipSynchronization: boolean = false) {
        this.position.x = x;
        this.position.y = y;

        if (!skipSynchronization) this.synchronize();
    }

    public rotate(rotation: number, skipSynchronization: boolean = false) {
        this.rotation = rotation;

        if (!skipSynchronization) this.synchronize();
    }

    public resize(width: number, height: number, skipSynchronization: boolean = false) {
        this.size.width = width;
        this.size.height = height;

        if (!skipSynchronization) this.synchronize();
    }

    public overlaps(range: { top: number, right: number, bottom: number, left: number }) {
        return this.position.x < range.right && this.position.x + this.size.width > range.left && this.position.y < range.bottom && this.position.y + this.size.height > range.top;
    }


    /**
     * Synchronizes the block element in DOM with the block properties.
     */
    public synchronize() {
        if (!this.element) return;

        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";

        this.element.style.width = this.size.width + "px";
        this.element.style.height = this.size.height + "px";

        this.element.style.transform = `rotate(${this.rotation}deg)`;

        this.element.classList.remove("block--selectable", "block--movable", "block--resizable", "block--rotatable");

        const support = this.editorSupport();

        if (support.selection) {
            this.element.classList.add("block--selectable");
        }
        if (support.movement) {
            this.element.classList.add("block--movable");
        }
        if (support.proportionalResizing || support.nonProportionalResizingX || support.nonProportionalResizingY) {
            this.element.classList.add("block--resizable");
        }
        if (support.rotation) {
            this.element.classList.add("block--rotatable");
        }

    }

    /**
     * Matches the width of the block with the rendered width of the block element.
     */
    public matchRenderedHeight() {
        this.size.height = this.element.clientHeight;

        if (this.getContent()) {
            this.size.height = this.getContent()!.clientHeight;
        }

        this.synchronize();
    }
}
