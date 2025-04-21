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
     * Destroy the editor instance, cleanup events and the main element
     */
    public destroy() {
        this.events.EDITOR_DESTROYED.emit();
        this.editorElement.innerHTML = "";
    }

    public setMode(mode: EditorMode) {
        this.mode = mode;

        for (let mode of Object.values(EditorMode)) {
            this.editorElement.classList.remove("editor--mode-" + mode);
        }

        this.editorElement.classList.add("editor--mode-" + mode);
        this.events.MODE_CHANGED.emit(mode);
    }

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
     * Serialize the editor data, so it can be saved and loaded later
     */
    public serialize(): Object {
        return {
            size: this.size,
            color: this.color,
        }
    }

    public screenToEditorCoordinates(screenX: number, screenY: number) {
        const offset = this.getOffset();
        const scale = this.getScale();

        return {
            x: (screenX - offset.x) / scale,
            y: (screenY - offset.y) / scale
        }
    }

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

    public getOffset() {
        const rect = this.editorElement.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top
        }
    }

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

        // TODO: this is ugly
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

        // console.log("[Editor] Block added", block);
        //
        // for (let block of this.blocks) {
        //     console.group("Block " + block.id);
        //     console.log(block);
        //     console.log(Reflect.getMetadataKeys(block));
        //
        //     for(let key of Reflect.getMetadataKeys(block)) {
        //         console.group(key);
        //
        //         console.log(Reflect.getMetadata(key, block));
        //
        //         console.groupEnd();
        //     }
        //
        //     console.groupEnd();
        // }
    }

    public setPreferences(newPreferences: EditorPreferences) {
        this.preferences = newPreferences;

        this.events.PREFERENCES_CHANGED.emit();
    }

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

        // this.fitToParent();
    }

    public recolor(color: string) {
        this.color = color;
        this.updateElement();
    }

    public getBlockById(blockId: string) {
        return this.blocks.find(block => block.id === blockId);
    }

    public getBlocksInGroup(group: string) {
        return this.blocks.filter(block => block.group === group);
    }

    public getSelector() {
        return this.selector;
    }

    public getContext() {
        return this.context;
    }

    public getClipboard() {
        return this.clipboard;
    }

    public getKeybinds() {
        return this.keybinds;
    }

    public getSnapping() {
        return this.snapping;
    }

    public getHistory() {
        return this.history;
    }

    public getSize() {
        return this.size;
    }

    public getScale() {
        return this.scale;
    }

    public getMode() {
        return this.mode;
    }

    public getEditorElement() {
        return this.editorElement;
    }

    public getWrapperElement() {
        return this.editorElement.parentElement!;
    }

    public getPreferences() {
        return this.preferences;
    }

    public getBlocks() {
        return this.blocks;
    }

    /**
     * This is a debug method to draw a point on the editor.
     * Should not be used in production.
     * @param initialX
     * @param initialY
     * @param color
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
     * This is a debug method to draw a line between two points on the editor.
     * Should not be used in production.
     * @param x
     * @param y
     * @param x2
     * @param y2
     * @param color
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

    clearBlocks() {
        for (let block of this.blocks) {
            block.element.remove();
            block.processEvent(BlockEvent.UNMOUNTED);
        }

        this.blocks = [];
        this.selector.deselectAllBlocks();
    }

    public setPluginCommunicator(pluginCommunicator: EditorPluginCommunicator) {
        this.pluginCommunicator = pluginCommunicator;
    }

    public getPluginCommunicator() {
        if (!this.pluginCommunicator) {
            throw new Error("Block renderer not set before rendering blocks");
        }

        return this.pluginCommunicator;
    }

    private parseOptions(options?: MaterialOptions) {
        if (!options) return;

        if (options.size) {
            this.size = options.size;
        }
        if(options.color) {
            this.color = options.color;
        }
    }

    private parsePreferences(preferences: EditorPreferences | undefined) {
        if (!preferences) {
            this.preferences = new EditorPreferences();
            return;
        }

        this.preferences = preferences;
    }

    private setupEditor() {
        this.setupUsage();
        this.setupEditorContent();
        this.fitToParent();
    }

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

    private usageResizeEvent() {
        if (this.preferences.KEEP_EDITOR_TO_FIT_PARENT) {
            this.fitToParent();
        }
    }

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

    public update() {
        this.updateElement();
    }

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

    private setupAttendee() {
        const room = communicator.getEditorRoom();

        if(!room) {
            return;
        }
        //
        // room.EVENTS.SYNCHRONIZE_BLOCK.on((blockData) => {
        //     const parsed = JSON.parse(blockData);
        //     const oldBlock = this.getBlockById(parsed.id);
        //
        //     console.log("Searching for a block with id", parsed);
        //     console.log("Found block", oldBlock);
        //     console.log("All blocks", this.blocks);
        //
        //     if(oldBlock) {
        //         for(let key in parsed) {
        //             (oldBlock as any)[key] = parsed[key as any];
        //         }
        //
        //         oldBlock.processDataChange(parsed);
        //     } else {
        //         const obj = this.blockRegistry.deserializeEditor(parsed);
        //
        //         if(!obj) return;
        //
        //         this.addBlock(obj);
        //     }
        // });

        // room.EVENTS.REMOVE_BLOCK.on((blockId) => {
        //     const block = this.getBlockById(blockId);
        //
        //     if(block) {
        //         this.removeBlock(block);
        //     }
        // });
    }
}
