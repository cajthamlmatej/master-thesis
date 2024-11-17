import type {Block} from "@/editor/block/Block";
import {EditorSelector} from "@/editor/selector/EditorSelector";
import {EditorContext} from "@/editor/context/EditorContext";
import {EditorClipboard} from "@/editor/clipboard/EditorClipboard";
import EditorEvents from "@/editor/EditorEvents";
import EditorGroupAreaVisualiser from "@/editor/groups/EditorGroupAreaVisualiser";
import EditorPreferences from "@/editor/EditorPreferences";
import {EditorMode} from "@/editor/EditorMode";
import type {EditorOptions} from "@/editor/EditorOptions";

export default class Editor {
    private static readonly DEFAULT_PADDING = 32;

    private readonly editorElement: HTMLElement;

    private mode: EditorMode = EditorMode.MOVE;

    private scale: number = 1;
    private size = {
        width: 1200,
        height: 800
    }
    private position = {
        x: 0,
        y: 0
    };

    private blocks: Block[] = [];

    private readonly selector: EditorSelector;
    private readonly context: EditorContext;
    private readonly clipboard: EditorClipboard;

    private preferences!: EditorPreferences;
    public readonly events = new EditorEvents();

    constructor(editorElement: HTMLElement, options?: EditorOptions, preferences?: EditorPreferences) {
        this.editorElement = editorElement;

        this.parseOptions(options);
        this.parsePreferences(preferences);
        this.setupEditor();

        this.context = new EditorContext(this);
        this.selector = new EditorSelector(this);
        this.clipboard = new EditorClipboard(this);

        // TODO: this enabling is weirdly placed
        new EditorGroupAreaVisualiser(this);
        this.setMode(EditorMode.MOVE);
    }

    private parseOptions(options?: EditorOptions) {
        if (!options) return;

        if (options.size) {
            this.size = options.size;
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

    public getSize() {
        return this.size;
    }

    public screenToEditorCoordinates(screenX: number, screenY: number) {
        const offset = this.getOffset();
        const scale = this.getScale();

        return {
            x: (screenX - offset.x) / scale,
            y: (screenY - offset.y) / scale
        }
    }

    public capPositionToEditorBounds(x: number, y: number) {
        const size = this.getSize();

        return {
            x: Math.max(0, Math.min(size.width, x)),
            y: Math.max(0, Math.min(size.height, y))
        }
    }

    public getOffset() {
        const rect = this.editorElement.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top
        }
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

    public addBlock(block: Block) {
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

        const maxZIndex = this.blocks.reduce((acc, block) => Math.max(acc, block.zIndex), 0);
        block.zIndex = Math.max(0, Math.min(1000, maxZIndex + 1));

        block.onMounted();
        block.synchronize();
    }

    public removeBlock(block: Block | string) {
        const blockId = typeof block === "string" ? block : block.id;
        const blockIndex = this.blocks.findIndex(block => block.id === blockId);

        if (blockIndex === -1) {
            console.error("[Editor] Block not found. Cannot remove.");
            return;
        }

        const blockInstance = this.blocks[blockIndex];
        blockInstance.element.remove();
        blockInstance.onUnmounted();
        this.blocks.splice(blockIndex, 1);

        if (this.selector.isSelected(blockInstance)) {
            this.selector.deselectBlock(blockInstance);
        }
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

    public setMode(mode: EditorMode) {
        this.mode = mode;

        for (let mode of Object.values(EditorMode)) {
            this.editorElement.classList.remove("editor--mode-" + mode);
        }

        this.editorElement.classList.add("editor--mode-" + mode);
        this.events.MODE_CHANGED.emit(mode);
    }

    private setupUsage() {
        window.addEventListener("resize", () => {
            if (this.preferences.KEEP_EDITOR_TO_FIT_PARENT) {
                this.fitToParent();
            }
        });
        window.addEventListener("mousedown", (event) => {
            if (this.mode !== EditorMode.MOVE) return;

            if (event.button !== 0) return;

            // Is inside the editor?
            if (!this.editorElement.parentElement!.contains(event.target as Node)) return;

            const handleMove = (event: MouseEvent) => {
                const offsetX = event.movementX;
                const offsetY = event.movementY;

                this.position = {
                    x: this.position.x + offsetX,
                    y: this.position.y + offsetY
                };

                this.updateElement();
            };
            const handleUp = (event: MouseEvent) => {
                window.removeEventListener("mousemove", handleMove);
                window.removeEventListener("mouseup", handleUp);
            };

            window.addEventListener("mousemove", handleMove);
            window.addEventListener("mouseup", handleUp);
        });
        window.addEventListener("wheel", (event) => {
            if (this.mode !== EditorMode.MOVE) return;

            if (!this.editorElement.parentElement!.contains(event.target as Node)) return;

            const rect = this.editorElement.getBoundingClientRect();
            // Get the mouse position relative to the editor element
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Calculate the new scale based on the wheel event
            const newScale = this.scale - event.deltaY / 1000;
            const scale = Math.max(0.1, Math.min(2, newScale));

            // To keep the position under the cursor, calculate the offset difference
            const scaleChange = scale / this.scale;

            // Adjust the position to keep the same point under the cursor
            this.position.x = mouseX - (mouseX - this.position.x) * scaleChange;
            this.position.y = mouseY - (mouseY - this.position.y) * scaleChange;

            // Apply the new scale
            this.scale = scale;

            // Update the element after scaling and adjusting its position
            this.updateElement();
        });
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

    private updateElement() {
        this.editorElement.style.left = this.position.x + "px";
        this.editorElement.style.top = this.position.y + "px";
        this.editorElement.style.transform = `scale(${this.scale})`;
        this.editorElement.style.width = this.size.width + "px";
        this.editorElement.style.height = this.size.height + "px";
    }


    private setupEditorContent() {
        this.editorElement.innerHTML = `<div class="editor-content"></div>`
    }


    /**
     * TODO: Remove this method
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
}
