import type Editor from "@/editor/Editor";
import {twoPolygonsIntersect} from "@/utils/collision";
import {getRotatedRectanglePoints} from "@/utils/spaceManipulation";
import type {Property} from "@/editor/property/Property";
import {PositionProperty} from "@/editor/property/base/PositionProperty";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {BlockEventListener, LISTENER_METADATA_KEY} from "@/editor/block/events/BlockListener";
import type {SerializeEntry} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockSerialize, SERIALIZER_METADATA_KEY} from "@/editor/block/serialization/BlockPropertySerialize";
import {RotationProperty} from "@/editor/property/base/RotationProperty";
import {SizeProperty} from "@/editor/property/base/SizeProperty";
import {BlockInteractiveProperty, BlockInteractivity} from "@/editor/interactivity/BlockInteractivity";
import {InteractivityProperty} from "@/editor/interactivity/InteractivityProperty";
import {BlockConstructor} from "@/editor/block/BlockConstructor";

export abstract class EditorBlock {
    @BlockSerialize("id")
    public id: string;
    @BlockSerialize("type")
    public type: string;
    @BlockSerialize("position")
    public position: {
        x: number;
        y: number;
    }
    @BlockSerialize("size")
    public size: {
        width: number;
        height: number;
    }
    @BlockSerialize("rotation")
    public rotation: number = 0;
    @BlockSerialize("zIndex")
    public zIndex: number = 0;
    @BlockSerialize("locked")
    public locked: boolean = false;
    @BlockSerialize("group")
    public group: string | undefined = undefined;
    @BlockSerialize("interactivity")
    public interactivity: BlockInteractivity[] = [];

    protected constructor(base: BlockConstructor) {
        this.id = base.id;
        this.type = base.type;
        this.position = base.position;
        this.size = base.size;
        this.rotation = base.rotation;
        this.zIndex = base.zIndex;
        this.locked = base.locked || false;
        this.group = base.group || undefined;
        this.interactivity = base.interactivity || [];
    }

    public element!: HTMLElement;
    protected editor!: Editor;
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

    /**
     * Renders the block element for the first time for the editor in the DOM.
     */
    public abstract render(): HTMLElement;

    /**
     * Returns a new instance of the block with the same properties.
     */
    public abstract clone(): EditorBlock;

    /**
     * Serializes the block properties to an object, so it can be saved.
     */
    public serialize(): Object {
        let serialized: any = {};

        const instance = this as any;
        const keys = Reflect.getMetadataKeys(this);

        for (const key of keys) {
            if (!key.startsWith(SERIALIZER_METADATA_KEY)) continue;

            const metadata = Reflect.getMetadata(key, this);

            if (!metadata) continue;

            const serializers = metadata as Set<SerializeEntry>;

            for (const serializer of serializers) {
                if (!(serializer.propertyKey in instance)) {
                    console.error(`Property ${serializer.propertyKey} does not exist on block ${this.id} (${this.type}).`);
                    continue;
                }

                if (serializer.key in serialized) {
                    console.error(`Key ${serializer.key} already exists on block ${this.id} (${this.type}).`);
                    continue;
                }

                serialized[serializer.key] = instance[serializer.propertyKey];
            }
        }

        // TODO: hotfix
        serialized = JSON.parse(JSON.stringify(serialized));

        return serialized;
    }

    /**
     * Returns the editor support for the block.
     */
    public editorSupport(): {
        group: boolean;
        selection: boolean;
        movement: boolean;
        proportionalResizing: boolean;
        nonProportionalResizingX: boolean;
        nonProportionalResizingY: boolean;
        rotation: boolean;
        zIndex: boolean;
        lock: boolean;
    } {
        return {
            group: true,
            selection: true,
            movement: true,
            proportionalResizing: true,
            nonProportionalResizingX: true,
            nonProportionalResizingY: true,
            rotation: true,
            zIndex: true,
            lock: true,
        }
    }

    public getProperties(): Property<this>[] {
        return [
            new PositionProperty(),
            new RotationProperty(),
            new SizeProperty(),
            new InteractivityProperty(),
        ]
    }

    public getInteractivityProperties(): Omit<BlockInteractiveProperty & {relative: boolean, animate: boolean}, "change" | "reset" | "getBaseValue">[] {
        return [
            {
                label: "Position X",
                relative: true,
                animate: true,
            },
            {
                label: "Position Y",
                relative: true,
                animate: true,
            },
            {
                label: "Width",
                relative: true,
                animate: true,
            },
            {
                label: "Height",
                relative: true,
                animate: true,
            },
            {
                label: "Rotation",
                relative: true,
                animate: true,
            },
            {
                label: "Z-Index",
                relative: true,
                animate: false,
            }
        ]
    }

    /**
     * Returns the content element of the block, if it has one.
     * Can be used to
     */
    public getContent(): HTMLElement | undefined {
        return undefined;
    }

    /**
     * Returns the editor for the block.
     */
    public getEditor() {
        return this.editor;
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

    public rotate(rotation: number, skipSynchronization: boolean = false, manual: boolean = false) {
        this.rotation = rotation;

        this.editor.events.BLOCK_ROTATION_CHANGED.emit({
            block: this,
            manual: manual
        });

        if (!skipSynchronization) this.synchronize();
    }

    public resize(width: number, height: number, skipSynchronization: boolean = false, manual: boolean = false) {
        if(width < 1) width = 1;
        if(height < 1) height = 1;

        this.size.width = width;
        this.size.height = height;

        this.editor.events.BLOCK_SIZE_CHANGED.emit({
            block: this,
            manual: manual
        });

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
        if (support.movement && this.canCurrentlyDo("move")) {
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

        this.editor.events.BLOCK_SIZE_CHANGED.emit({
            block: this,
            manual: true
        });

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
            if (!key.startsWith(LISTENER_METADATA_KEY)) continue;

            const metadata = Reflect.getMetadata(key, this);

            if (!metadata) continue;

            const listeners = metadata.get(event);

            if (!listeners) continue;

            for (const listener of listeners) {
                if (!instance[listener]) {
                    console.error(`Listener ${listener} for event ${event} does not exist on block ${this.id} (${this.type}).`);
                    continue
                }

                instance[listener](...args);
            }
        }
    }

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
        this.editor.events.HISTORY.emit();
    }

    @BlockEventListener(BlockEvent.MOVEMENT_STARTED)
    private _onMovementStarted() {
        this.moving = true;
    }

    @BlockEventListener(BlockEvent.MOVEMENT_ENDED)
    private _onMovementCompleted(start: { x: number; y: number; }) {
        this.moving = false;
        this.editor.events.HISTORY.emit();
    }

    @BlockEventListener(BlockEvent.ROTATION_STARTED)
    private _onRotationStarted() {
        this.rotating = true;
    }

    @BlockEventListener(BlockEvent.ROTATION_ENDED)
    private _onRotationCompleted(start: number) {
        this.rotating = false;
        this.editor.events.HISTORY.emit();
    }
}
