import type Editor from "@/editor/Editor";
import {twoPolygonsIntersect} from "@/utils/collision";
import {getRotatedRectanglePoints} from "@/utils/spaceManipulation";
import type {Property} from "@/editor/property/Property";
import {PositionProperty} from "@/editor/property/base/PositionProperty";
import {BlockEvent} from "@/editor/block/BlockEvent";
import {BlockEventListener, LISTENER_METADATA_KEY} from "@/editor/block/BlockListener";

export abstract class EditorBlock {
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
    public locked: boolean = false;
    public group: string | undefined = undefined;

    public element!: HTMLElement;
    public editor!: Editor;

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

    public abstract editorSupport(): {
        group: boolean;
        selection: boolean;
        movement: boolean;
        proportionalResizing: boolean;
        nonProportionalResizingX: boolean;
        nonProportionalResizingY: boolean;
        rotation: boolean;
        zIndex: boolean;
        lock: boolean;
    }

    public abstract clone(): EditorBlock;

    public abstract serialize(): Object;

    public getProperties(): Property[] {
        return [
            new PositionProperty()
        ]
    }

    /**
     * Serializes the base properties of the block.
     * @protected
     */
    protected serializeBase(): Object {
        return {
            id: this.id,
            type: this.type,
            position: this.position,
            size: this.size,
            rotation: this.rotation,
            zIndex: this.zIndex,
            locked: this.locked,
            group: this.group,
        };
    }

    public getContent(): HTMLElement | undefined {
        return undefined;
    }

    public move(x: number, y: number, skipSynchronization: boolean = false, manual: boolean = false) {
        this.position.x = Math.floor(x);
        this.position.y = Math.floor(y);

        this.editor.events.BLOCK_POSITION_CHANGED.emit({
            block: this,
            manual: manual
        });

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

    public zIndexUp() {
        this.zIndex = Math.max(0, Math.min(1000, this.zIndex + 1));
        this.synchronize();
    }

    public zIndexDown() {
        this.zIndex = Math.max(0, Math.min(1000, this.zIndex - 1));
        this.synchronize();
    }

    public zIndexMaxDown() {
        const lowest = this.editor.getBlocks().filter(b => b.editorSupport().selection).reduce((acc, block) => Math.min(acc, block.zIndex), this.zIndex);

        this.zIndex = Math.max(0, Math.min(1000, lowest - 1));
        this.synchronize();
    }

    public zIndexMaxUp() {
        const highest = this.editor.getBlocks().filter(b => b.editorSupport().selection).reduce((acc, block) => Math.max(acc, block.zIndex), this.zIndex);

        this.zIndex = Math.max(0, Math.min(1000, highest + 1));
        this.synchronize();
    }

    /**
     * Locks the block element for the block to be uneditable.
     */
    public lock() {
        this.locked = true;
        this.synchronize();
    }

    /**
     * Unlocks the block element for the block to be editable.
     */
    public unlock() {
        this.locked = false;
        this.synchronize();
    }

    /**
     * Sets the editor for the block.
     *
     * If the block already has an editor, an error is thrown.
     * @param editor The editor to set.
     */
    public setEditor(editor: Editor) {
        if (this.editor) {
            throw new Error("Block already has an editor.");
        }

        this.editor = editor;
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
        this.element.style.zIndex = this.zIndex.toString();

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

        if (this.locked) {
            this.element.classList.add("block--locked");
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

    /**
     * Checks if supplied box range overlaps with this block including rotation.
     * @param range The range to check for overlap.
     */
    public overlaps(range: { topLeft: { x: number, y: number }, bottomRight: { x: number, y: number } }) {
        const rotatedCorners = getRotatedRectanglePoints(this.position.x, this.position.y, this.size.width, this.size.height, this.rotation);

        const rangeCorners = [
            range.topLeft,
            {x: range.topLeft.x, y: range.bottomRight.y},
            range.bottomRight,
            {x: range.bottomRight.x, y: range.topLeft.y},
        ];

        return twoPolygonsIntersect(rotatedCorners, rangeCorners);
    }

    /**
     * After editorSupport() has been called, this method can be used to check if the block can currently do a certain action.
     * The element could be in a state, that doesn't allow the action to be performed.
     * @param action
     */
    public canCurrentlyDo(action: 'select' | 'move' | 'resize' | 'rotate') {
        if (this.locked && action !== 'select') {
            return false;
        }

        return true;
    }

    /**
     * Calls all event listeners for the supplied event with the supplied arguments.
     *
     * Listeners are methods that are decorated with `@BlockEventListener(event: BlockEvent)`.
     * @param event The event to call the listeners for.
     * @param args The arguments to pass to the listeners.
     */
    public processEvent(event: BlockEvent, ...args: any[]) {
        const instance = this as any;
        const keys = Reflect.getMetadataKeys(this);

        for (const key of keys) {
            if(!key.startsWith(LISTENER_METADATA_KEY)) continue;

            const metadata = Reflect.getMetadata(key, this);

            if(!metadata) continue;

            const listeners = metadata.get(event);

            if(!listeners) continue;

            for (const listener of listeners) {
                if(!instance[listener]) {
                    console.error(`Listener ${listener} for event ${event} does not exist on block ${this.id} (${this.type}).`);
                    continue
                }

                instance[listener](...args);
            }
        }
    }

    /**
     * Determines if the block is currently selected.
     */
    public selected: boolean = false;
    /**
     * Determines if the block is currently resizing.
     */
    public resizing: boolean = false;
    /**
     * Determines if the block is currently moving.
     */
    public moving: boolean = false;
    /**
     * Determines if the block is currently rotating.
     */
    public rotating: boolean = false;
    /**
     * Determines if the block is currently hovering.
     */
    public hovering: boolean = false;

    @BlockEventListener(BlockEvent.SELECTED)
    private _onSelected() {
        this.element.classList.add("block--selected");
        this.selected = true;
    }

    @BlockEventListener(BlockEvent.DESELECTED)
    private _onDeselected() {
        this.element.classList.remove("block--selected");
        this.selected = false;
    }

    @BlockEventListener(BlockEvent.HOVER_STARTED)
    private _onHoverStarted() {
        this.element.classList.add("block--hover");
        this.hovering = true;
    }

    @BlockEventListener(BlockEvent.HOVER_ENDED)
    private _onHoverEnded() {
        this.element.classList.remove("block--hover");
        this.hovering = false;
    }

    @BlockEventListener(BlockEvent.RESIZING_STARTED)
    private _onResizeStarted() {
        this.resizing = true;
    }

    @BlockEventListener(BlockEvent.RESIZING_ENDED)
    private _onResizeCompleted(type: 'PROPORTIONAL' | 'NON_PROPORTIONAL', start: { width: number; height: number; }) {
        this.resizing = false;
    }

    @BlockEventListener(BlockEvent.MOVEMENT_STARTED)
    private _onMovementStarted() {
        this.moving = true;
    }

    @BlockEventListener(BlockEvent.MOVEMENT_ENDED)
    private _onMovementCompleted(start: { x: number; y: number; }) {
        this.moving = false;
    }

    @BlockEventListener(BlockEvent.ROTATION_STARTED)
    private _onRotationStarted() {
        this.rotating = true;
    }

    @BlockEventListener(BlockEvent.ROTATION_ENDED)
    private _onRotationCompleted(start: number) {
        this.rotating = false;
    }
}
