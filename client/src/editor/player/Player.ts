import {BlockRegistry} from "@/editor/block/BlockRegistry";
import {PlayerBlock} from "@/editor/block/PlayerBlock";

export default class Player {
    private static readonly DEFAULT_PADDING = 32;
    public readonly blockRegistry: BlockRegistry;

    private _size = {width: 1200, height: 800};
    private blocks: PlayerBlock[] = [];

    private readonly element: HTMLElement;
    // Mode
    private scale: number = 1;
    private position = {x: 0, y: 0};

    constructor(element: HTMLElement, size: { width: number, height: number }, blocks: PlayerBlock[]) {
        this.blockRegistry = new BlockRegistry();
        this.element = element;
        this._size = size;

        this.setupPlayer();
        this.fitToParent();
        this.setupUsage();

        this.setBlocks(blocks);
    }

    public addBlock(block: PlayerBlock) {
        this.blocks.push(block);

        const element = block.render();
        element.setAttribute("data-block-id", block.id);

        // TODO: this is ugly
        this.element.querySelector(".player-content")!.appendChild(element);

        block.element = element;
        block.setPlayer(this);

        // block.onMounted(); // TODO: call this?
        block.synchronize();

        block.afterRender();
    }

    public fitToParent() {
        const parent = this.element.parentElement;

        if (!parent) {
            console.log("[Editor] Parent element not found");
            return;
        }

        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight;

        // Calculate the scale to fit the parent
        const scaleX = parentWidth / this._size.width;
        const scaleY = parentHeight / this._size.height;

        const scale = Math.min(scaleX, scaleY);

        this.scale = scale;

        // Calculate the scaled dimensions
        const scaledWidth = this._size.width * scale;
        const scaledHeight = this._size.height * scale;

        // Set the position to center
        const offsetX = (parentWidth - scaledWidth) / 2;
        const offsetY = (parentHeight - scaledHeight) / 2;

        this.position = {
            x: offsetX,
            y: offsetY
        }

        this.updateElement();
    }

    public getSize(): { width: number; height: number } {
        return this._size;
    }

    /**
     * Returns the blocks in the player.
     */
    public getBlocks() {
        return this.blocks;
    }

    private setBlocks(blocks: PlayerBlock[]) {
        for (const block of blocks) {
            this.addBlock(block);
        }
    }

    private setupUsage() {
        window.addEventListener("resize", () => {
            this.fitToParent(); // TODO: not always needed
        }); // TODO: remove listener
    }

    private updateElement() {
        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";
        this.element.style.transform = `scale(${this.scale})`;
        this.element.style.width = this._size.width + "px";
        this.element.style.height = this._size.height + "px";
    }

    private setupPlayer() {
        this.element.innerHTML = `<div class="player-content"></div>`
    }
}
