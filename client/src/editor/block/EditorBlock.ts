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
import {OpacityProperty} from "@/editor/property/base/OpacityProperty";
import {generateUUID} from "@/utils/Generators";
import {
    BLOCK_API_FEATURE_METADATA_KEY,
    EditorBlockApiFeatureEntry,
    RegisterEditorBlockApiFeature
} from "@/editor/plugin/editor/RegisterEditorBlockApiFeature";
import {MoveBlockApiFeature} from "@/editor/plugin/editor/api/block/MoveBlock";
import {RotateBlockApiFeature} from "@/editor/plugin/editor/api/block/RotateBlock";
import {ResizeBlockApiFeature} from "@/editor/plugin/editor/api/block/ResizeBlock";
import {ChangeBlockOpacityApiFeature} from "@/editor/plugin/editor/api/block/ChangeBlockOpacityApiFeature";
import {SetBlockZIndexApiFeature} from "@/editor/plugin/editor/api/block/SetBlockZIndex";
import {LockBlockApiFeature} from "@/editor/plugin/editor/api/block/LockBlock";
import {UnlockBlockApiFeature} from "@/editor/plugin/editor/api/block/UnlockBlock";
import {BlockInformationProperty} from "@/editor/property/base/BlockInformationProperty";

@RegisterEditorBlockApiFeature(MoveBlockApiFeature)
@RegisterEditorBlockApiFeature(RotateBlockApiFeature)
@RegisterEditorBlockApiFeature(ResizeBlockApiFeature)
@RegisterEditorBlockApiFeature(ChangeBlockOpacityApiFeature)
@RegisterEditorBlockApiFeature(SetBlockZIndexApiFeature)
@RegisterEditorBlockApiFeature(LockBlockApiFeature)
@RegisterEditorBlockApiFeature(UnlockBlockApiFeature)
/**
 * Represents a block in the editor environment. This abstract class provides
 * the base functionality for rendering, synchronizing, and interacting with blocks
 * in the editor.
 */
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
    @BlockSerialize("opacity")
    public opacity: number = 1;
    @BlockSerialize("locked")
    public locked: boolean = false;
    @BlockSerialize("group")
    public group: string | undefined = undefined;
    @BlockSerialize("interactivity")
    public interactivity: BlockInteractivity[] = [];
    public element!: HTMLElement;
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
    protected editor!: Editor;

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
        this.opacity = base.opacity === undefined ? 1 : base.opacity;
    }

    /**
     * Renders the block element for the first time for the editor in the DOM.
     * @returns The rendered HTMLElement.
     */
    public abstract render(): HTMLElement;

    /**
     * Returns a new instance of the block with the same properties.
     * @returns A cloned instance of the block.
     */
    public abstract clone(): EditorBlock;

    /**
     * Serializes the block properties to an object for saving.
     * @returns A serialized object representing the block.
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

        // note(Matej): deep clone the object to prevent circular references and other issues
        serialized = JSON.parse(JSON.stringify(serialized));

        return serialized;
    }

    /**
     * Returns the editor support capabilities for the block.
     * @returns An object describing the editor support capabilities.
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

    /**
     * Retrieves the properties of the block.
     * @returns An array of properties associated with the block.
     */
    public getProperties(): Property<this>[] {
        return [
            new BlockInformationProperty(),
            new PositionProperty(),
            new SizeProperty(),
            new RotationProperty(),
            new OpacityProperty(),
            new InteractivityProperty(),
        ]
    }

    /**
     * Retrieves the interactivity properties of the block.
     * @returns An array of interactivity properties.
     */
    public getInteractivityProperties(): Omit<BlockInteractiveProperty & {
        relative: boolean,
        animate: boolean
    }, "change" | "reset" | "getBaseValue">[] {
        return [
            {
                label: "position-x",
                relative: true,
                animate: true,
            },
            {
                label: "position-y",
                relative: true,
                animate: true,
            },
            {
                label: "width",
                relative: true,
                animate: true,
            },
            {
                label: "height",
                relative: true,
                animate: true,
            },
            {
                label: "rotation",
                relative: true,
                animate: true,
            },
            {
                label: "z-index",
                relative: true,
                animate: false,
            },
            {
                label: "opacity",
                relative: true,
                animate: true,
            }
        ]
    }

    /**
     * Returns the content element of the block, if it has one.
     * @returns The content element or undefined.
     */
    public getContent(): HTMLElement | undefined {
        return undefined;
    }

    /**
     * Returns the editor instance associated with the block.
     * @returns The editor instance.
     */
    public getEditor() {
        return this.editor;
    }

    /**
     * Moves the block to a new position.
     * @param x The new x-coordinate.
     * @param y The new y-coordinate.
     * @param skipSynchronization Whether to skip synchronization.
     * @param manual Whether the move was manual.
     */
    public move(x: number, y: number, skipSynchronization: boolean = false, manual: boolean = false) {
        this.position.x = Math.floor(x);
        this.position.y = Math.floor(y);

        if (!skipSynchronization) this.synchronize();

        this.editor.events.BLOCK_POSITION_CHANGED.emit({
            block: this,
            manual: manual
        });
    }

    /**
     * Rotates the block to a new angle.
     * @param rotation The new rotation angle in degrees.
     * @param skipSynchronization Whether to skip synchronization.
     * @param manual Whether the rotation was manual.
     */
    public rotate(rotation: number, skipSynchronization: boolean = false, manual: boolean = false) {
        this.rotation = rotation;

        this.editor.events.BLOCK_ROTATION_CHANGED.emit({
            block: this,
            manual: manual
        });

        if (!skipSynchronization) this.synchronize();
    }

    /**
     * Resizes the block to new dimensions.
     * @param width The new width.
     * @param height The new height.
     * @param skipSynchronization Whether to skip synchronization.
     * @param manual Whether the resize was manual.
     */
    public resize(width: number, height: number, skipSynchronization: boolean = false, manual: boolean = false) {
        if (width < 1) width = 1;
        if (height < 1) height = 1;

        this.size.width = width;
        this.size.height = height;

        this.editor.events.BLOCK_SIZE_CHANGED.emit({
            block: this,
            manual: manual
        });

        if (!skipSynchronization) this.synchronize();
    }

    /**
     * Sets the z-index of the block.
     * @param zIndex The new z-index value.
     */
    public setZIndex(zIndex: number) {
        this.zIndex = Math.max(0, Math.min(1000, zIndex));
        this.synchronize();
        this.editor.events.BLOCK_CHANGED.emit(this);
    }

    /**
     * Increases the z-index of the block by 1.
     */
    public zIndexUp() {
        this.zIndex = Math.max(0, Math.min(1000, this.zIndex + 1));

        this.synchronize();
        this.editor.events.BLOCK_CHANGED.emit(this);
    }

    /**
     * Decreases the z-index of the block by 1.
     */
    public zIndexDown() {
        this.zIndex = Math.max(0, Math.min(1000, this.zIndex - 1));

        this.synchronize();
        this.editor.events.BLOCK_CHANGED.emit(this);
    }

    /**
     * Sets the z-index of the block to the lowest value among selectable blocks.
     */
    public zIndexMaxDown() {
        const lowest = this.editor.getBlocks().filter(b => b.editorSupport().selection).reduce((acc, block) => Math.min(acc, block.zIndex), this.zIndex);

        this.zIndex = Math.max(0, Math.min(1000, lowest - 1));
        this.synchronize();

        this.editor.events.BLOCK_CHANGED.emit(this);
    }

    /**
     * Sets the z-index of the block to the highest value among selectable blocks.
     */
    public zIndexMaxUp() {
        const highest = this.editor.getBlocks().filter(b => b.editorSupport().selection).reduce((acc, block) => Math.max(acc, block.zIndex), this.zIndex);

        this.zIndex = Math.max(0, Math.min(1000, highest + 1));
        this.synchronize();

        this.editor.events.BLOCK_CHANGED.emit(this);
    }

    /**
     * Locks the block, making it uneditable.
     */
    public lock() {
        this.locked = true;
        this.synchronize();
    }

    /**
     * Unlocks the block, making it editable.
     */
    public unlock() {
        this.locked = false;
        this.synchronize();
    }

    /**
     * Changes the opacity of the block.
     * @param value The new opacity value.
     * @param manual Whether the change was manual.
     */
    public changeOpacity(value: number, manual: boolean = false) {
        this.opacity = value;
        this.editor.events.BLOCK_OPACITY_CHANGED.emit({
            block: this,
            manual: manual
        });
        this.synchronize();
    }

    /**
     * Sets the editor instance for the block.
     * @param editor The editor instance to associate with the block.
     * @throws Error if the block already has an editor.
     */
    public setEditor(editor: Editor) {
        if (this.editor) {
            throw new Error("Block already has an editor.");
        }

        this.editor = editor;
    }

    /**
     * Synchronizes the block's DOM element with its properties.
     */
    public synchronize() {
        if (!this.element) return;

        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";

        this.element.style.width = this.size.width + "px";
        this.element.style.height = this.size.height + "px";

        this.element.style.transform = `rotate(${this.rotation}deg)`;
        this.element.style.opacity = this.opacity.toString();
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
     * Matches the height of the block with the rendered height of its element.
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
     * Checks if the block overlaps with a given range, including rotation.
     * @param range The range to check for overlap.
     * @returns A boolean indicating if the block overlaps with the range.
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
     * Checks if the block can currently perform a specific action.
     * @param action The action to check.
     * @returns A boolean indicating if the action can be performed.
     */
    public canCurrentlyDo(action: 'select' | 'move' | 'resize' | 'rotate') {
        if (this.locked && action !== 'select') {
            return false;
        }

        return true;
    }

    /**
     * Processes an event by calling all registered listeners for the event.
     * @param event The event to process.
     * @param args Arguments to pass to the event listeners.
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

    /**
     * Retrieves the API features available for the block.
     * @returns An array of API feature entries.
     */
    public getApiFeatures(): EditorBlockApiFeatureEntry[] {
        const target = Object.getPrototypeOf(this).constructor;
        const keys = Reflect.getMetadataKeys(target);
        const apiFeatures: EditorBlockApiFeatureEntry[] = [];

        for (const key of keys) {
            if (!key.startsWith(BLOCK_API_FEATURE_METADATA_KEY)) continue;

            const metadata = Reflect.getMetadata(key, target);

            if (!metadata) continue;

            const metadataFeatures = metadata as Set<EditorBlockApiFeatureEntry>;

            for (const feature of metadataFeatures) {
                apiFeatures.push(feature);
            }
        }

        return apiFeatures;
    }

    /**
     * Processes a data change and synchronizes the block.
     * @param data The data to process.
     */
    public processDataChange(data: any) {
        this.synchronize();
    }

    /**
     * Retrieves the base properties for cloning the block.
     * @returns A BlockConstructor object with the base properties.
     */
    protected getCloneBase(): BlockConstructor {
        return {
            id: generateUUID(),
            type: this.type,
            position: {x: this.position.x, y: this.position.y},
            size: {width: this.size.width, height: this.size.height},
            rotation: this.rotation,
            zIndex: this.zIndex,
            locked: this.locked,
            group: this.group,
            interactivity: this.interactivity,
            opacity: this.opacity
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
        this.element.classList.add("block--moving");
        this.moving = true;
    }

    @BlockEventListener(BlockEvent.MOVEMENT_ENDED)
    private _onMovementCompleted(start: { x: number; y: number; }) {
        this.element.classList.remove("block--moving");
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
