import {BlockRegistry} from "@/editor/block/BlockRegistry";
import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {PlayerMode} from "@/editor/player/PlayerMode";
import {PlayerDraw} from "@/editor/player/PlayerDraw";
import PlayerEvents from "@/editor/player/PlayerEvents";
import {PlayerPluginCommunicator} from "@/editor/player/PlayerPluginCommunicator";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {EditorBlock} from "@/editor/block/EditorBlock";
import type {MaterialOptions} from "@/editor/MaterialOptions";
import {PluginPlayerBlock} from "@/editor/block/base/plugin/PluginPlayerBlock";

/**
 * Represents the main player responsible for rendering and managing blocks,
 * handling user interactions, and managing the canvas state.
 */
export default class Player {
    private static readonly DEFAULT_PADDING = 32;

    public readonly blockRegistry: BlockRegistry;
    public readonly events = new PlayerEvents();
    private readonly element: HTMLElement;

    private mode: PlayerMode = PlayerMode.PLAY;
    private pluginCommunicator: PlayerPluginCommunicator;
    private draw: PlayerDraw;

    private size = {width: 1200, height: 800};
    private color: string = "#ffffff";

    private blocks: PlayerBlock[] = [];

    private scale: number = 1;
    private position = {x: 0, y: 0};

    private resizeEvent: () => void;
    private mouseDownEvent: (event: MouseEvent) => void;
    private wheelEvent: (event: WheelEvent) => void;
    private touchEvent: (event: TouchEvent) => void;
    private pluginCommunicatorPromiseResolve: (any?: any) => void;
    private pluginCommunicatorPromise = new Promise((r) => this.pluginCommunicatorPromiseResolve = r);

    /**
     * Creates a new Player instance.
     * @param element The HTML element to render the player in.
     * @param options Configuration options for the player.
     */
    constructor(element: HTMLElement, options: MaterialOptions) {
        this.blockRegistry = new BlockRegistry();
        this.element = element;

        this.parseOptions(options);

        this.setupPlayer();
        this.fitToParent();
        this.setupUsage();

        this.changeMode(PlayerMode.PLAY);

        this.draw = new PlayerDraw(this);

        console.log("[Player] Player initialized");
        this.events.LOADED.emit();
    }

    /**
     * Returns the root HTML element of the player.
     * @returns The root HTML element.
     */
    public getElement() {
        return this.element;
    }

    /**
     * Adds a block to the player and renders it.
     * @param block The block to add.
     */
    public addBlock(block: PlayerBlock) {
        this.blocks.push(block);

        const element = block.render();
        element.setAttribute("data-block-id", block.id);

        this.element.querySelector(".player-content")!.appendChild(element);

        block.element = element;
        block.setPlayer(this);

        block.processEvent(BlockEvent.MOUNTED);
        block.synchronize();

        block.afterRender();
    }

    /**
     * Adjusts the player's size and position to fit its parent element.
     */
    public fitToParent() {
        const parent = this.element.parentElement;

        if (!parent) {
            console.log("[Editor] Parent element not found");
            return;
        }

        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight;

        // Calculate the scale to fit the parent
        const scaleX = parentWidth / this.size.width;
        const scaleY = parentHeight / this.size.height;

        const scale = Math.min(scaleX, scaleY);

        this.scale = scale;

        // Calculate the scaled dimensions
        const scaledWidth = this.size.width * scale;
        const scaledHeight = this.size.height * scale;

        // Set the position to center
        const offsetX = (parentWidth - scaledWidth) / 2;
        const offsetY = (parentHeight - scaledHeight) / 2;

        this.position = {
            x: offsetX,
            y: offsetY
        }

        this.updateElement();
    }

    /**
     * Changes the player's mode (e.g., play, move, draw).
     * @param mode The new mode to set.
     */
    public changeMode(mode: PlayerMode) {
        this.mode = mode;

        this.element.classList.remove("player--mode-play");
        this.element.classList.remove("player--mode-move");
        this.element.classList.remove("player--mode-draw");
        this.element.classList.add("player--mode-" + mode);

        this.events.MODE_CHANGED.emit(mode);
    }

    /**
     * Converts screen coordinates to editor coordinates.
     * @param screenX The X coordinate on the screen.
     * @param screenY The Y coordinate on the screen.
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
     * Gets the current offset of the player on the screen.
     * @returns The offset as an object with x and y properties.
     */
    public getOffset() {
        const rect = this.element.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top
        }
    }

    /**
     * Gets the current scale of the player.
     * @returns The scale factor.
     */
    public getScale() {
        return this.scale;
    }

    /**
     * Gets the current size of the player.
     * @returns The size as an object with width and height properties.
     */
    public getSize(): { width: number; height: number } {
        return this.size;
    }

    /**
     * Returns all blocks currently in the player.
     * @returns An array of PlayerBlock instances.
     */
    public getBlocks() {
        return this.blocks;
    }

    /**
     * Finds a block by its ID.
     * @param blockId The ID of the block to find.
     * @returns The block if found, or undefined otherwise.
     */
    public getBlockById(blockId: string) {
        const block = this.blocks.find(block => block.id === blockId);

        if (!block) {
            return undefined;
        }

        return block;
    }

    /**
     * Destroys the player and cleans up event listeners.
     */
    public destroy() {
        console.log("[Player] Destroying player");
        window.removeEventListener("resize", this.resizeEvent);
        window.removeEventListener("mousedown", this.mouseDownEvent);
        window.removeEventListener("wheel", this.wheelEvent);
        window.removeEventListener("touchstart", this.touchEvent);
        this.events.PLAYER_DESTROYED.emit();
    }

    /**
     * Gets the current mode of the player.
     * @returns The current PlayerMode.
     */
    public getMode() {
        return this.mode;
    }

    /**
     * Gets the PlayerDraw instance associated with the player.
     * @returns The PlayerDraw instance.
     */
    public getDraw() {
        return this.draw;
    }

    /**
     * Sets the plugin communicator for the player.
     * @param pluginCommunicator The PlayerPluginCommunicator instance.
     */
    public setPluginCommunicator(pluginCommunicator: PlayerPluginCommunicator) {
        this.pluginCommunicator = pluginCommunicator;
        this.pluginCommunicatorPromiseResolve();
    }

    /**
     * Asynchronously gets the plugin communicator.
     * @returns A promise that resolves to the PlayerPluginCommunicator instance.
     */
    public async getPluginCommunicator() {
        await this.pluginCommunicatorPromise;

        // if (!this.pluginCommunicator) {
        //     throw new Error("Block renderer not set before rendering blocks");
        // }

        return this.pluginCommunicator;
    }

    /**
     * Removes a block from the player by its instance or ID.
     * @param block The block instance or ID to remove.
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

        blockInstance.element.remove();
        this.blocks.splice(blockIndex, 1);
    }

    /**
     * Adds multiple blocks to the player.
     * @param blocks An array of PlayerBlock instances to add.
     */
    public addBlocks(blocks: PlayerBlock[]) {
        for (const block of blocks) {
            this.addBlock(block);
        }
    }

    /**
     * Gets the current position of the player.
     * @returns The position as an object with x and y properties.
     */
    public getPosition() {
        return this.position;
    }

    /**
     * Updates the player's HTML element to reflect its current state.
     */
    public updateElement() {
        this.element.style.backgroundColor = this.color;
        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";
        this.element.style.transformOrigin = `0 0`;
        this.element.style.transform = `scale(${this.scale})`;
        this.element.style.width = this.size.width + "px";
        this.element.style.height = this.size.height + "px";
    }

    /**
     * Redraws all blocks in the player.
     */
    public redrawBlocks() {
        this.getBlocks().filter(b => b instanceof PluginPlayerBlock).forEach((block: PluginPlayerBlock) => {
            block.renderIframe();
        });
    }

    /**
     * Parses the provided options and applies them to the player.
     * @param options The MaterialOptions to parse.
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
     * Handles mouse down events for moving the canvas.
     * @param event The mouse event.
     */
    private usageMouseDownEvent(event: MouseEvent) {
        if (this.mode !== PlayerMode.MOVE) return;

        if (event.button !== 0) return;

        if (!this.element.parentElement!.contains(event.target as Node)) return;

        const start = this.screenToEditorCoordinates(event.clientX, event.clientY);

        const handleMove = (event: MouseEvent) => {
            const end = this.screenToEditorCoordinates(event.clientX, event.clientY);
            const offsetX = end.x - start.x;
            const offsetY = end.y - start.y;

            this.position = {
                x: this.position.x + offsetX * this.scale,
                y: this.position.y + offsetY * this.scale
            };

            this.events.CANVAS_REPOSITION.emit();

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
     * Handles wheel events for zooming the canvas.
     * @param event The wheel event.
     */
    private usageWheelEvent(event: WheelEvent) {
        if (this.mode !== PlayerMode.MOVE) return;

        if (!this.element.parentElement!.contains(event.target as Node)) return;

        const zoomIntensity = 0.2;
        const scaleFactor = 1 - event.deltaY * zoomIntensity * 0.01;
        const newScale = Math.max(0.05, Math.min(6, this.scale * scaleFactor));

        if (newScale === this.scale) return;

        const rect = this.element.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const scaleChange = newScale / this.scale;

        this.position.x -= (mouseX * (scaleChange - 1));
        this.position.y -= (mouseY * (scaleChange - 1));

        this.scale = newScale;
        this.events.CANVAS_REPOSITION.emit();

        this.updateElement();
    }

    /**
     * Sets up event listeners for user interactions.
     */
    private setupUsage() {
        this.resizeEvent = this.usageResizeEvent.bind(this);
        this.mouseDownEvent = this.usageMouseDownEvent.bind(this);
        this.wheelEvent = this.usageWheelEvent.bind(this);
        this.touchEvent = this.usageTouchEvent.bind(this);

        window.addEventListener("resize", this.resizeEvent);
        window.addEventListener("mousedown", this.mouseDownEvent);
        window.addEventListener("wheel", this.wheelEvent);
        window.addEventListener("touchstart", this.touchEvent);
    }

    /**
     * Handles touch events for moving or zooming the canvas.
     * @param event The touch event.
     */
    private usageTouchEvent(event: TouchEvent) {
        if (event.touches.length === 2) {
            if (this.mode !== PlayerMode.MOVE) return;

            if (!this.element.parentElement!.contains(event.target as Node)) return;

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

                const rect = this.element.getBoundingClientRect();

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
            if (this.mode !== PlayerMode.MOVE) return;

            if (!this.element.parentElement!.contains(event.target as Node)) return;

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
     * Handles resize events to adjust the player's size.
     */
    private usageResizeEvent() {
        if (this.mode === PlayerMode.MOVE) return;

        this.fitToParent();
    }

    /**
     * Sets up the player's HTML structure.
     */
    private setupPlayer() {
        this.element.innerHTML = `<div class="player-content"></div>`
    }
}
