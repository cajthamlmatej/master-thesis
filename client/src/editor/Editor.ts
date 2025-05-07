import type {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorSelector} from "@/editor/selector/EditorSelector";
import {EditorContext} from "@/editor/context/EditorContext";
import {EditorClipboard} from "@/editor/clipboard/EditorClipboard";
import EditorEvents from "@/editor/EditorEvents";
import EditorGroupAreaVisualiser from "@/editor/visualiser/EditorGroupAreaVisualiser";
import EditorPreferences from "@/editor/EditorPreferences";
import {EditorMode} from "@/editor/EditorMode";
import type {MaterialOptions} from "@/editor/MaterialOptions";
import {BlockRegistry} from "@/editor/block/BlockRegistry";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {EditorKeybinds} from "@/editor/EditorKeybinds";
import {EditorHistory} from "@/editor/history/EditorHistory";
import {EditorPluginCommunicator} from "@/editor/EditorPluginCommunicator";
import EditorAttendeeAreaVisualiser from "@/editor/visualiser/EditorAttendeeSelectedAreaVisualiser";
import {communicator} from "@/api/websockets";
import EditorSnappingVisualiser from "@/editor/visualiser/EditorSnappingVisualiser";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";

/**
 * The `Editor` class is the main entry point for managing the editor's state, 
 * rendering, and interactions. It handles blocks, user input, and visual updates.
 */
export default class Editor {
    private static readonly DEFAULT_PADDING = 32;
    public readonly events = new EditorEvents();
    public readonly blockRegistry: BlockRegistry;

    private size = {width: 1200, height: 800};
    private color: string = "#ffffff";
    private blocks: EditorBlock[] = [];

    private readonly editorElement: HTMLElement;
    private mode: EditorMode = EditorMode.SELECT;
    private scale: number = 1;
    private position = {x: 0, y: 0};
    private preferences!: EditorPreferences;

    private readonly selector: EditorSelector;
    private readonly context: EditorContext;
    private readonly clipboard: EditorClipboard;
    private readonly keybinds: EditorKeybinds;
    private readonly history: EditorHistory;
    private readonly snapping: EditorSnappingVisualiser;

    private pluginCommunicator: EditorPluginCommunicator;

    /**
     * Constructs a new `Editor` instance.
     * @param editorElement - The root HTML element for the editor.
     * @param options - Optional configuration for the editor (e.g., size, color).
     * @param preferences - Optional user preferences for the editor.
     */
    constructor(editorElement: HTMLElement, options?: MaterialOptions, preferences?: EditorPreferences) {
        this.editorElement = editorElement;
        this.blockRegistry = new BlockRegistry();

        this.parseOptions(options);
        this.parsePreferences(preferences);
        this.setupEditor();
        this.setupAttendee();

        this.context = new EditorContext(this);
        this.selector = new EditorSelector(this);
        this.clipboard = new EditorClipboard(this);
        this.history = new EditorHistory(this);

        new EditorGroupAreaVisualiser(this);
        new EditorAttendeeAreaVisualiser(this);
        this.snapping = new EditorSnappingVisualiser(this);

        this.keybinds = new EditorKeybinds(this);

        this.setMode(EditorMode.SELECT);
    }

    /**
     * Destroys the editor instance, cleans up events, and clears the main element.
     */
    public destroy() {
        this.events.EDITOR_DESTROYED.emit();
        this.editorElement.innerHTML = "";
    }

    /**
     * Sets the editor's mode and updates the UI accordingly.
     * @param mode - The new mode to set (e.g., SELECT, MOVE).
     */
    public setMode(mode: EditorMode) {
        this.mode = mode;

        for (let mode of Object.values(EditorMode)) {
            this.editorElement.classList.remove("editor--mode-" + mode);
        }

        this.editorElement.classList.add("editor--mode-" + mode);
        this.events.MODE_CHANGED.emit(mode);
    }

    /**
     * Adjusts the editor's size and scale to fit its parent container.
     */
    public fitToParent() {
        const parent = this.editorElement.parentElement;

        if (!parent) {
            console.log("[Editor] Parent element not found");
            return;
        }

        const parentWidth = parent.clientWidth - Editor.DEFAULT_PADDING;
        const parentHeight = parent.clientHeight - Editor.DEFAULT_PADDING;

        // Calculate the scale to fit the parent
        const scaleX = parentWidth / this.size.width;
        const scaleY = parentHeight / this.size.height;

        const scale = Math.min(scaleX, scaleY);

        this.scale = scale;

        // Calculate the scaled dimensions
        const scaledWidth = this.size.width * scale;
        const scaledHeight = this.size.height * scale;

        // Set the position to center
        const offsetX = (parentWidth - scaledWidth) / 2 + Editor.DEFAULT_PADDING / 2;
        const offsetY = (parentHeight - scaledHeight) / 2 + Editor.DEFAULT_PADDING / 2;

        this.position = {
            x: offsetX,
            y: offsetY
        }

        this.updateElement();
    }

    /**
     * Serializes the editor's state into an object for saving or loading.
     * @returns An object representing the editor's state.
     */
    public serialize(): Object {
        return {
            size: this.size,
            color: this.color,
        }
    }

    /**
     * Converts screen coordinates to editor coordinates.
     * @param screenX - The X coordinate on the screen.
     * @param screenY - The Y coordinate on the screen.
     * @returns The corresponding editor coordinates.
     */
    public screenToEditorCoordinates(screenX: number, screenY: number) {
        const offset = this.getOffset();
        const scale = this.getScale();

        return {
            x: (screenX - offset.x) / scale,
            y: (screenY - offset.y) / scale
        }
    }

    /**
     * Caps a position to ensure it stays within the editor's bounds.
     * @param x - The X coordinate.
     * @param y - The Y coordinate.
     * @param width - Optional width of the element.
     * @param height - Optional height of the element.
     * @returns The adjusted position within bounds.
     */
    public capPositionToEditorBounds(x: number, y: number, width?: number, height?: number) {
        if (!width || !height) {
            const size = this.getSize();

            return {
                x: Math.max(0, Math.min(size.width, x)),
                y: Math.max(0, Math.min(size.height, y))
            }
        }

        return {
            x: Math.max(0, Math.min(this.size.width - width, x)),
            y: Math.max(0, Math.min(this.size.height - height, y))
        }
    }

    /**
     * Gets the offset of the editor element relative to the viewport.
     * @returns The offset as an object with `x` and `y` properties.
     */
    public getOffset() {
        const rect = this.editorElement.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top
        }
    }

    /**
     * Adds a block to the editor.
     * @param block - The block to add.
     * @param newBlock - Whether the block is newly created (default: true).
     */
    public addBlock(block: EditorBlock, newBlock: boolean = true) {
        // Check if the block is already added
        if (this.blocks.includes(block)) {
            console.error("[Editor] Block is already added. Not adding again.");
            return
        }

        block.setEditor(this);
        this.blocks.push(block);

        const element = block.render();
        element.setAttribute("data-block-id", block.id);

        this.editorElement.querySelector(".editor-content")!.appendChild(element);

        block.element = element;

        if (newBlock) {
            const maxZIndex = this.blocks
                .filter(b => b.editorSupport().selection)
                .reduce((acc, block) => Math.max(acc, block.zIndex), 0);
            block.zIndex = Math.max(0, Math.min(1000, maxZIndex + 1));
        }

        block.processEvent(BlockEvent.MOUNTED);
        block.synchronize();

        if (newBlock) {
            this.events.BLOCK_ADDED.emit(block);
            this.events.HISTORY.emit();
        }
    }

    /**
     * Updates the editor's preferences.
     * @param newPreferences - The new preferences to set.
     */
    public setPreferences(newPreferences: EditorPreferences) {
        this.preferences = newPreferences;

        this.events.PREFERENCES_CHANGED.emit();
    }

    /**
     * Removes a block from the editor by instance or ID.
     * @param block - The block instance or ID to remove.
     */
    public removeBlock(block: EditorBlock | string) {
        const blockId = typeof block === "string" ? block : block.id;
        const blockIndex = this.blocks.findIndex(block => block.id === blockId);

        if (blockIndex === -1) {
            console.error("[Editor] Block not found. Cannot remove.");
            return;
        }

        const blockInstance = this.blocks[blockIndex];

        blockInstance.processEvent(BlockEvent.UNMOUNTED);
        if (this.selector.isSelected(blockInstance)) {
            this.selector.deselectBlock(blockInstance, true);
        }

        blockInstance.element.remove();
        this.blocks.splice(blockIndex, 1);

        this.events.BLOCK_REMOVED.emit(blockInstance);
        this.events.HISTORY.emit();
    }

    /**
     * Resizes the editor and optionally adjusts blocks to fit the new size.
     * @param width - The new width of the editor.
     * @param height - The new height of the editor.
     * @param resizeToFit - Whether to resize blocks to fit the new dimensions.
     */
    public resize(width: number, height: number, resizeToFit: boolean) {
        const originalWidth = this.size.width;
        const originalHeight = this.size.height;

        const originalAspectRatio = originalWidth / originalHeight;
        const newAspectRatio = width / height;

        this.size.width = width;
        this.size.height = height;

        if (resizeToFit) {
            const scaleX = width / originalWidth;
            const scaleY = height / originalHeight;

            let scale;
            let offsetX = 0;
            let offsetY = 0;

            if (originalAspectRatio === newAspectRatio) {
                // Uniform scaling
                scale = scaleX;
            } else if (newAspectRatio > originalAspectRatio) {
                // Height remains full, scale by height
                scale = scaleY;
                offsetX = (width - originalWidth * scale) / 2;
            } else {
                // Width remains full, scale by width
                scale = scaleX;
                offsetY = (height - originalHeight * scale) / 2;
            }

            for (let block of this.blocks) {
                const newX = block.position.x * scale + offsetX;
                const newY = block.position.y * scale + offsetY;
                block.move(newX, newY);

                const newWidth = block.size.width * scale;
                const newHeight = block.size.height * scale;
                block.resize(newWidth, newHeight);
            }
        }
    }

    /**
     * Changes the editor's background color.
     * @param color - The new color to set.
     */
    public recolor(color: string) {
        this.color = color;
        this.updateElement();
    }

    /**
     * Retrieves a block by its ID.
     * @param blockId - The ID of the block to retrieve.
     * @returns The block instance, or undefined if not found.
     */
    public getBlockById(blockId: string) {
        return this.blocks.find(block => block.id === blockId);
    }

    /**
     * Retrieves all blocks in a specific group.
     * @param group - The group name.
     * @returns An array of blocks in the group.
     */
    public getBlocksInGroup(group: string) {
        return this.blocks.filter(block => block.group === group);
    }

    /**
     * Gets the editor's selector instance.
     * @returns The `EditorSelector` instance.
     */
    public getSelector() {
        return this.selector;
    }

    /**
     * Gets the editor's context instance.
     * @returns The `EditorContext` instance.
     */
    public getContext() {
        return this.context;
    }

    /**
     * Gets the editor's clipboard instance.
     * @returns The `EditorClipboard` instance.
     */
    public getClipboard() {
        return this.clipboard;
    }

    /**
     * Gets the editor's keybinds instance.
     * @returns The `EditorKeybinds` instance.
     */
    public getKeybinds() {
        return this.keybinds;
    }

    /**
     * Gets the editor's snapping visualizer instance.
     * @returns The `EditorSnappingVisualiser` instance.
     */
    public getSnapping() {
        return this.snapping;
    }

    /**
     * Gets the editor's history instance.
     * @returns The `EditorHistory` instance.
     */
    public getHistory() {
        return this.history;
    }

    /**
     * Gets the editor's size.
     * @returns The size as an object with `width` and `height` properties.
     */
    public getSize() {
        return this.size;
    }

    /**
     * Gets the editor's current scale.
     * @returns The scale factor.
     */
    public getScale() {
        return this.scale;
    }

    /**
     * Gets the editor's current mode.
     * @returns The current `EditorMode`.
     */
    public getMode() {
        return this.mode;
    }

    /**
     * Gets the root HTML element of the editor.
     * @returns The editor's root element.
     */
    public getEditorElement() {
        return this.editorElement;
    }

    /**
     * Gets the wrapper element containing the editor.
     * @returns The wrapper element.
     */
    public getWrapperElement() {
        return this.editorElement.parentElement!;
    }

    /**
     * Gets the editor's preferences.
     * @returns The `EditorPreferences` instance.
     */
    public getPreferences() {
        return this.preferences;
    }

    /**
     * Gets all blocks currently in the editor.
     * @returns An array of `EditorBlock` instances.
     */
    public getBlocks() {
        return this.blocks;
    }

    /**
     * Draws a debug point on the editor (for development purposes only).
     * @param initialX - The X coordinate of the point.
     * @param initialY - The Y coordinate of the point.
     * @param color - The color of the point.
     */
    debugPoint(initialX: number, initialY: number, color: string) {
        const size = 10;

        const point = document.createElement("div");
        point.style.position = "absolute";
        point.style.width = size + "px";
        point.style.height = size + "px";
        point.style.borderRadius = "50%";
        point.style.backgroundColor = color;
        point.style.zIndex = "100000";
        point.style.left = (initialX - size / 2) + "px";
        point.style.top = (initialY - size / 2) + "px";
        this.editorElement.querySelector(".editor-content")!.appendChild(point);
    }

    /**
     * Draws a debug line between two points on the editor (for development purposes only).
     * @param x - The starting X coordinate.
     * @param y - The starting Y coordinate.
     * @param x2 - The ending X coordinate.
     * @param y2 - The ending Y coordinate.
     * @param color - The color of the line.
     */
    debugLine(x: number, y: number, x2: number, y2: number, color: string) {
        const line = document.createElement("div");
        const length = Math.sqrt((x2 - x) ** 2 + (y2 - y) ** 2);

        const angle = Math.atan2(y2 - y, x2 - x) * (180 / Math.PI);

        line.style.position = "absolute";
        line.style.transformOrigin = "0 0";
        line.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
        line.style.width = `${length}px`;
        line.style.height = "2px";
        line.style.backgroundColor = color;

        this.editorElement.querySelector(".editor-content")!.appendChild(line);
    }

    /**
     * Clears all blocks from the editor.
     */
    clearBlocks() {
        for (let block of this.blocks) {
            block.element.remove();
            block.processEvent(BlockEvent.UNMOUNTED);
        }

        this.blocks = [];
        this.selector.deselectAllBlocks();
    }

    /**
     * Sets the plugin communicator for the editor.
     * @param pluginCommunicator - The `EditorPluginCommunicator` instance.
     */
    public setPluginCommunicator(pluginCommunicator: EditorPluginCommunicator) {
        this.pluginCommunicator = pluginCommunicator;
    }

    /**
     * Gets the plugin communicator for the editor.
     * @returns The `EditorPluginCommunicator` instance.
     * @throws An error if the communicator is not set.
     */
    public getPluginCommunicator() {
        if (!this.pluginCommunicator) {
            throw new Error("Block renderer not set before rendering blocks");
        }

        return this.pluginCommunicator;
    }

    /**
     * Updates the editor's visual state.
     */
    public update() {
        this.updateElement();
    }

    /**
     * Redraws all blocks in the editor.
     */
    public redrawBlocks() {
        this.getBlocks().filter(b => b instanceof PluginEditorBlock).forEach((block: PluginEditorBlock) => {
            block.renderIframe();
        });
    }

    /**
     * Parses the provided options and applies them to the editor.
     * @param options - The options to parse.
     */
    private parseOptions(options?: MaterialOptions) {
        if (!options) return;

        if (options.size) {
            this.size = options.size;
        }
        if (options.color) {
            this.color = options.color;
        }
    }

    /**
     * Parses the provided preferences and applies them to the editor.
     * @param preferences - The preferences to parse.
     */
    private parsePreferences(preferences: EditorPreferences | undefined) {
        if (!preferences) {
            this.preferences = new EditorPreferences();
            return;
        }

        this.preferences = preferences;
    }

    /**
     * Sets up the editor's initial state and content.
     */
    private setupEditor() {
        this.setupUsage();
        this.setupEditorContent();
        this.fitToParent();
    }

    /**
     * Sets up event listeners for user interactions.
     */
    private setupUsage() {
        const resizeEvent = this.usageResizeEvent.bind(this);
        const mouseDownEvent = this.usageMouseDownEvent.bind(this);
        const wheelEvent = this.usageWheelEvent.bind(this);
        const touchEvent = this.usageTouchEvent.bind(this);

        window.addEventListener("resize", resizeEvent);
        window.addEventListener("mousedown", mouseDownEvent);
        window.addEventListener("wheel", wheelEvent);
        window.addEventListener("touchstart", touchEvent);

        this.events.EDITOR_DESTROYED.on(() => {
            window.removeEventListener("resize", resizeEvent);
            window.removeEventListener("mousedown", mouseDownEvent);
            window.removeEventListener("wheel", wheelEvent);
            window.removeEventListener("touchstart", touchEvent);
        });
    }

    /**
     * Handles the resize event for the editor.
     */
    private usageResizeEvent() {
        if (this.preferences.KEEP_EDITOR_TO_FIT_PARENT) {
            this.fitToParent();
        }
    }

    /**
     * Handles the mouse down event for the editor.
     * @param event - The mouse event.
     */
    private usageMouseDownEvent(event: MouseEvent) {
        if (this.mode !== EditorMode.MOVE) return;

        if (event.button !== 0) return;

        if (!this.editorElement.parentElement!.contains(event.target as Node)) return;

        const start = this.screenToEditorCoordinates(event.clientX, event.clientY);

        const handleMove = (event: MouseEvent) => {
            const end = this.screenToEditorCoordinates(event.clientX, event.clientY);
            const offsetX = end.x - start.x;
            const offsetY = end.y - start.y;

            this.position = {
                x: this.position.x + offsetX * this.scale,
                y: this.position.y + offsetY * this.scale
            };

            this.updateElement();
        };
        const handleUp = (event: MouseEvent) => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
    }

    /**
     * Handles the wheel event for zooming in/out of the editor.
     * @param event - The wheel event.
     */
    private usageWheelEvent(event: WheelEvent) {
        if (this.mode !== EditorMode.MOVE) return;

        if (!this.editorElement.parentElement!.contains(event.target as Node)) return;

        const zoomIntensity = 0.2;
        const scaleFactor = 1 - event.deltaY * zoomIntensity * 0.01;
        const newScale = Math.max(0.05, Math.min(6, this.scale * scaleFactor));

        if (newScale === this.scale) return;

        const rect = this.editorElement.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const scaleChange = newScale / this.scale;

        this.position.x -= (mouseX * (scaleChange - 1));
        this.position.y -= (mouseY * (scaleChange - 1));

        this.scale = newScale;

        this.updateElement();
    }

    /**
     * Handles touch events for interacting with the editor.
     * @param event - The touch event.
     */
    private usageTouchEvent(event: TouchEvent) {
        if (event.touches.length === 2) {
            if (this.mode !== EditorMode.MOVE) return;

            if (!this.editorElement.parentElement!.contains(event.target as Node)) return;

            let startOne = {x: event.touches[0].clientX, y: event.touches[0].clientY};
            let startTwo = {x: event.touches[1].clientX, y: event.touches[1].clientY};

            let startDistance = Math.sqrt((startTwo.x - startOne.x) ** 2 + (startTwo.y - startOne.y) ** 2);

            const touchMove = (event: TouchEvent) => {
                let moveOne = {x: event.touches[0].clientX, y: event.touches[0].clientY};
                let moveTwo = {x: event.touches[1].clientX, y: event.touches[1].clientY};

                let moveDistance = Math.sqrt((moveTwo.x - moveOne.x) ** 2 + (moveTwo.y - moveOne.y) ** 2);

                let scaleFactor = moveDistance / startDistance;

                let newScale = Math.max(0.05, Math.min(6, this.scale * scaleFactor));

                if (newScale === this.scale) return;

                const rect = this.editorElement.getBoundingClientRect();

                const mouseX = (moveOne.x + moveTwo.x) / 2 - rect.left;
                const mouseY = (moveOne.y + moveTwo.y) / 2 - rect.top;

                const scaleChange = newScale / this.scale;

                this.position.x -= (mouseX * (scaleChange - 1));
                this.position.y -= (mouseY * (scaleChange - 1));

                this.scale = newScale;

                this.updateElement();
            }

            const touchEnd = (event: TouchEvent) => {
                window.removeEventListener("touchmove", touchMove);
                window.removeEventListener("touchend", touchEnd);
            }

            window.addEventListener("touchmove", touchMove);
            window.addEventListener("touchend", touchEnd);
        } else if (event.touches.length === 1) {
            if (this.mode !== EditorMode.MOVE) return;

            if (!this.editorElement.parentElement!.contains(event.target as Node)) return;

            const start = this.screenToEditorCoordinates(event.touches[0].clientX, event.touches[0].clientY);

            const handleMove = (event: TouchEvent) => {
                const end = this.screenToEditorCoordinates(event.touches[0].clientX, event.touches[0].clientY);
                const offsetX = end.x - start.x;
                const offsetY = end.y - start.y;

                this.position = {
                    x: this.position.x + offsetX * this.scale,
                    y: this.position.y + offsetY * this.scale
                };

                this.updateElement();
            };
            const handleUp = () => {
                window.removeEventListener("touchmove", handleMove, {capture: true});
                window.removeEventListener("touchend", handleUp);
            };

            window.addEventListener("touchmove", handleMove, {capture: true});
            window.addEventListener("touchend", handleUp);
            window.addEventListener("touchcancel", handleUp);
        }
    }

    /**
     * Sets up the editor's content area.
     */
    private setupEditorContent() {
        this.editorElement.innerHTML = `<div class="editor-content"></div>`;

        const content = this.editorElement.querySelector(".editor-content")! as HTMLElement;

        // note(Matej): This is a hack to prevent scrolling in the editor
        //   updating the scroll position to 0 every time it changes.
        //   This is a workaround because some blocks - respectively browsers
        //   randomly scrolls focused (for example input/contenteditable) elements
        //   so they are visible.
        //   The editor content is overflow: hidden, so the scroll is not visible,
        //   but the element can be still scrolled by the browser or/and the JS.
        const observer = new MutationObserver((mutations, observer) => {
            content.scrollTop = 0;
        });

        observer.observe(content, {attributes: true, childList: true, subtree: true});
    }

    /**
     * Updates the editor's root element with the current state.
     */
    private updateElement() {
        this.editorElement.style.backgroundColor = this.color;
        this.editorElement.style.left = this.position.x + "px";
        this.editorElement.style.top = this.position.y + "px";
        this.editorElement.style.transform = `scale(${this.scale})`;
        this.editorElement.style.transformOrigin = `0 0`;
        this.editorElement.style.width = this.size.width + "px";
        this.editorElement.style.height = this.size.height + "px";
        this.editorElement.style.setProperty("--scale", this.scale.toString());
    }

    /**
     * Sets up attendee-related functionality for the editor.
     */
    private setupAttendee() {
        const room = communicator.getEditorRoom();

        if (!room) {
            return;
        }
    }
}
