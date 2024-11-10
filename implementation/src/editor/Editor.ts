import type {Block} from "@/editor/block/Block";
import {EditorSelector} from "@/editor/selector/EditorSelector";
import {EditorContext} from "@/editor/context/EditorContext";
import {EditorClipboard} from "@/editor/clipboard/EditorClipboard";
import EditorEvents from "@/editor/EditorEvents";
import EditorGroupAreaVisualiser from "@/editor/groups/EditorGroupAreaVisualiser";
import EditorPreferences from "@/editor/EditorPreferences";

interface EditorOptions {
    size: {
        width: number;
        height: number;
    }
}

export default class Editor {
    private static readonly SCALING_PRECISION: number = 2;
    private static readonly MIN_PADDING = 32;
    private static readonly PADDING = Editor.MIN_PADDING * 5;

    private readonly editorElement: HTMLElement;
    private scale: number = 1;
    private size = {
        width: 1200,
        height: 800
    }
    private preferences!: EditorPreferences;

    private blocks: Block[] = [];
    private readonly selector: EditorSelector;
    private readonly context: EditorContext;
    private readonly clipboard: EditorClipboard;

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
    }

    private parseOptions(options?: EditorOptions) {
        if(!options) return;

        if (options.size) {
            this.size = options.size;
        }
    }

    private parsePreferences(preferences: EditorPreferences | undefined) {
        if(!preferences) {
            this.preferences = new EditorPreferences();
            return;
        }

        this.preferences = preferences;
    }
    private setupEditor() {
        this.setupScaling();
        this.setupEditorContent();
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

        if(this.selector.isSelected(blockInstance)) {
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


    private calculateScale() {
        const parent = this.editorElement.parentElement;

        if (!parent) {
            console.log("[Editor] Parent element not found");
            return;
        }

        // Set the editor scale to arbitrary value
        this.editorElement.style.width = `10px`;
        this.editorElement.style.height = `10px`;

        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight;

        let targetWidth = parentWidth - Editor.MIN_PADDING;
        let targetHeight = parentHeight - Editor.MIN_PADDING;

        if(parentWidth > screen.width / 2 && parentHeight > screen.height / 2) {
            targetWidth = parentWidth - Editor.PADDING;
            targetHeight = parentHeight - Editor.PADDING;
        }

        // Determine scale to fully fit the parent (using only the transform scale)
        const scaleX = targetWidth / this.size.width;
        const scaleY = targetHeight / this.size.height;

        let scale = Math.min(scaleX, scaleY);
        let precisionFactor = Math.pow(10, Editor.SCALING_PRECISION);
        scale = Math.floor(scale * precisionFactor) / precisionFactor;

        // Restore the original size
        this.editorElement.style.width = `${this.size.width}px`;
        this.editorElement.style.height = `${this.size.height}px`;

        // Set the scale
        this.editorElement.style.setProperty('--editor-scale', scale.toString());

        this.scale = scale;
    }
    private setupScaling() {
        this.calculateScale();

        window.addEventListener("resize", () => {
            this.calculateScale();
        });
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
        point.style.left = (initialX-size/2) + "px";
        point.style.top = (initialY-size/2) + "px";
        this.editorElement.querySelector(".editor-content")!.appendChild(point);
    }
}
