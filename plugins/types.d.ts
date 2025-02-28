interface TextPluginProperty {
    type: 'text';
    label: string;
}

interface BooleanPluginProperty {
    type: 'boolean';
    label: string;
}

interface ColorPluginProperty {
    type: 'color';
    label: string;
}

interface NumberPluginProperty {
    type: 'number';
    label: string;
}
 interface SelectPluginProperty {
    type: 'select';
    label: string;
    options: { value: string; label: string }[];
}

interface PluginPropertyBase {
    type: string;
    key: string;
}

type PluginProperty = PluginPropertyBase & (
    | TextPluginProperty
    | BooleanPluginProperty
    | ColorPluginProperty
    | NumberPluginProperty
    | SelectPluginProperty
);


interface PluginBlock {
    type: 'plugin';
    plugin: string;
    data: Record<string, string>;
    properties: PluginProperty[];
}

interface IframeBlock {
    type: 'iframe';
    content: string;
}

interface ImageBlock {
    type: 'image';
    imageUrl: string | undefined;
    mediaId: string | undefined;
    aspectRatio: boolean;
}

interface InteractiveAreaBlock {
    type: 'interactiveArea';
}

interface MermaidBlock {
    type: 'mermaid';
    content: string;
}

interface ShapeBlock {
    type: 'shape';
    shape: string; // TODO: maybe type this already?
    color: string;
}

interface TextBlock {
    type: 'text';
    content: string;
    fontSize: number;
}

interface WatermarkBlock {
    type: 'watermark';
}

interface BlockBaseData {
    id: string;
    type: 'plugin' | 'iframe' | 'image' | 'interactiveArea' | 'mermaid' | 'shape' | 'text' | 'watermark';
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    rotation: number;
    zIndex: number;
    opacity: number;
}

interface BlockBaseActions {
    unlock(): void;
    lock(): void;
    setZIndex(zIndex: number): void;
    /**
     * Change the opacity of the block.
     * @param opacity The new opacity value. Must be a number between 0 and 1.
     */
    changeOpacity(opacity: number): void;
    /**
     * Move the block to the specified x and y position.
     * @param x The new x position of the block.
     * @param y The new y position of the block.
     */
    move(x: number, y: number): void;
    /**
     * Resizes the block to the specified width and height.
     * @param width The new width of the block. Has to be greater than 0.
     * @param height The new height of the block. Has to be greater than 0.
     */
    resize(width: number, height: number): void;
    /**
     * Rotates the block by the specified number of degrees.
     * @param rotation The new rotation of the block in degrees.
     */
    rotate(rotation: number): void;
}


type BlockType = 
    | PluginBlock
    | IframeBlock
    | ImageBlock
    | InteractiveAreaBlock
    | MermaidBlock
    | ShapeBlock
    | TextBlock
    | WatermarkBlock;

type Block = BlockBaseData & BlockBaseActions & BlockType;


type CreateBlockType = 
    | Omit<PluginBlock, "plugin">
    | IframeBlock
    | ImageBlock
    | InteractiveAreaBlock
    | MermaidBlock
    | ShapeBlock
    | TextBlock
    | WatermarkBlock;

type CreateBlock = Omit<BlockBaseData, "id"> & CreateBlockType;

interface ApiEditor {
    getBlocks(): Block[];
    removeBlock(id: string): void;
    /**
     * Add a new block to the editor. The supplied data has to be in the correct format for the block type.
     * The block will recieve a unique ID and be added to the editor.
     * @param block The block data to add to the editor.
     * @returns The ID of the newly added block.
     */
    addBlock(block: CreateBlock): string;
    getSize(): { width: number, height: number };
    setSize(width: number, height: number, resizeToFit: boolean): void;
    getMode(): 'select' | 'move';
    setMode(mode: 'select' | 'move'): void;
    selectBlock(id: string, addToSelection?: boolean): void;
    deselectBlock(id: string): void;
    isBlockSelected(id: string): boolean;

    /**
     * Called when the editor requests a block to be rendered.
     * Can be called for many different reasons, for example:
     *  - block is selected or deselected
     *  - block was created
     *  - block properties were changed
     *  - and more
     * @param eventName 'renderBlock'
     * @param callback A function that takes a block and returns a string. The string should be the HTML content of the block.
     */
    on(eventName: 'renderBlock', callback: (block: PluginBlock) => string): void;
    on(eventName: 'panelRegister', callback: () => string): void;
    on(eventName: 'panelMessage', callback: (message: string) => void): void;
}

interface FetchOptions {
    /**
     * The HTTP method to use for the request. Default is 'GET'.
     */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    /**
     * The request headers to send with the request.
     */
    headers?: Record<string, string>;
    /**
     * The body to send with the request. Only used for POST, PUT, DELETE and PATCH requests.
     */
    body?: string;
}

interface Api {
    /**
     * Log a message to the console. Can be used for debugging.
     * @param message The message to log.
     */
    log(message: string): void;
    /**
     * Fetch data from the specified URL. Returns a promise that resolves with the response body as a string.
     * The URL has to be added in manifest.json to be accessible. Follow the instructions in the documentation.
     * @param url The URL to fetch data from.
     * @param options  Optional options for the fetch request.
     */
    fetch(url: string, options?: FetchOptions): Promise<string>;

    /**
     * Represents the current editor instance. Use this to interact with the editor.
     * Editor is one slide in the presentation and changes for each slide.
     */
    editor: ApiEditor;
}

declare global {
    /**
     * The global API object that can be used to interact with the platform.
     */
    var api: Api;
}

export {};