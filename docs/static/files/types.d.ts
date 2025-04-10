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


interface PluginEditorBlock {
    type: 'plugin';
    plugin: string;
    data: Record<string, string>;
    properties: PluginProperty[];
}

interface PluginEditorBlockActions {
    sendMessage(message: string): void;
    render(): void;
}


interface IframeEditorBlock {
    type: 'iframe';
    content: string;
}

interface ImageEditorBlock {
    type: 'image';
    imageUrl: string | undefined;
    mediaId: string | undefined;
    aspectRatio: boolean;
}

interface InteractiveAreaEditorBlock {
    type: 'interactiveArea';
}

interface MermaidEditorBlock {
    type: 'mermaid';
    content: string;
}

interface ShapeEditorBlock {
    type: 'shape';
    shape: string; // TODO: maybe type this already?
    color: string;
}

interface TextEditorBlock {
    type: 'text';
    content: string;
    fontSize: number;
}

interface WatermarkEditorBlock {
    type: 'watermark';
}

interface EditorBlockBaseData {
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

interface EditorBlockBaseActions {
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


type EditorBlockType = 
    | (PluginEditorBlock & PluginEditorBlockActions)
    | IframeEditorBlock
    | ImageEditorBlock
    | InteractiveAreaEditorBlock
    | MermaidEditorBlock
    | ShapeEditorBlock
    | TextEditorBlock
    | WatermarkEditorBlock;

type EditorBlock = EditorBlockBaseData & EditorBlockBaseActions & EditorBlockType;


type CreateEditorBlockType = 
    | Omit<PluginEditorBlock, "plugin">
    | IframeEditorBlock
    | ImageEditorBlock
    | InteractiveAreaEditorBlock
    | MermaidEditorBlock
    | ShapeEditorBlock
    | TextEditorBlock
    | WatermarkEditorBlock;

type CreateEditorBlock = Omit<EditorBlockBaseData, "id"> & CreateEditorBlockType;

interface ApiEditor {
    getBlocks(): EditorBlock[];
    removeBlock(id: string): void;
    /**
     * Add a new block to the editor. The supplied data has to be in the correct format for the block type.
     * Created block will be selected after creation.
     * 
     * The block will recieve a unique ID and be added to the editor.
     * If the block is a plugin block, the block's plugin will be set to this plugin.
     * 
     * @param block The block data to add to the editor.
     * @returns The ID of the newly added block.
     */
    addBlock(block: CreateEditorBlock): string;

    selectBlock(id: string, addToSelection?: boolean): void;
    deselectBlock(id: string): void;
    isBlockSelected(id: string): boolean;

    getMode(): 'select' | 'move';
    setMode(mode: 'select' | 'move'): void;

    getSize(): { width: number, height: number };
    setSize(width: number, height: number, resizeToFit: boolean): void;
    
    /**
     * Calls the callback when the editor requests a block to be rendered.
     * Only requests for this plugin's plugin blocks are sent to this function. 
     * Can be called for multiple reasons, but has to be the "base evaluation" of the block.
     * You can continue to communicate with this block using the plugin block's methods.
     * 
     * **Calling this function multiple times will overwrite the previous callback.**
     * @param eventName 'blockRender'
     * @param callback The returned string should be the HTML content of the block.
     */
    on(eventName: 'pluginBlockRender', callback: (block: EditorBlockBaseData & EditorBlockBaseActions & PluginEditorBlock & PluginEditorBlockActions) => string): void;
    on(eventName: 'panelRegister', callback: () => string): void;
    on(eventName: 'panelMessage', callback: (message: string) => void): void;
    on(eventName: 'pluginBlockMessage', callback: (block: EditorBlockBaseData & EditorBlockBaseActions & PluginEditorBlock & PluginEditorBlockActions, message: string) => void): void;
    /**
     * Calls the callback when a property of a this plugin's block changes.
     * @param eventName 'blockPropertyChange'
     * @param callback Block and block property key.
     */
    on(eventName: 'pluginBlockPropertyChange', callback: (block: EditorBlockBaseData & EditorBlockBaseActions & PluginEditorBlock & PluginEditorBlockActions, property: string) => void): void;

    /**
     * Sends a message to this plugin's panel. The message will be received by the window's `message` event.
     * @param message The message to send to the panel.
     */
    sendPanelMessage(message: string): void;
}

// Currently the types are exactly the same as for the editor, but they might differ in the future
type PlayerBlockType = 
    | PluginEditorBlock
    | IframeEditorBlock
    | ImageEditorBlock
    | InteractiveAreaEditorBlock
    | MermaidEditorBlock
    | ShapeEditorBlock
    | TextEditorBlock
    | WatermarkEditorBlock;

type PlayerBlock = EditorBlockBaseData /*& EditorBlockBaseActions*/ & PlayerBlockType;


type CreatePlayerBlockType = 
    | Omit<PluginEditorBlock, "plugin">
    | IframeEditorBlock
    | ImageEditorBlock
    | InteractiveAreaEditorBlock
    | MermaidEditorBlock
    | ShapeEditorBlock
    | TextEditorBlock
    | WatermarkEditorBlock;

type CreatePlayerBlock = Omit<PlayerBlock, "id"> & CreatePlayerBlockType;

type FullPlayerBlock = EditorBlockBaseData & EditorBlockBaseActions & PluginEditorBlock & PluginEditorBlockActions;

interface ApiPlayer {
    getBlocks(): PlayerBlock[];
    removeBlock(id: string): void;
    addBlock(block: CreatePlayerBlock): string;

    getMode(): 'select' | 'move';
    setMode(mode: 'select' | 'move'): void;
    
    on(eventName: 'pluginBlockMessage', callback: (block: FullPlayerBlock, message: string) => void): void;
    on(eventName: 'pluginBlockRender', callback: (block: FullPlayerBlock) => string): void;
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

interface ApiCache {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
}

interface Api {
    /**
     * Represents the current editor instance. Use this to interact with the editor.
     * Editor is one slide in the presentation and changes for each slide.
     * 
     * **The editor is available just in the editor plugin script.**
     */
    editor: ApiEditor;

    /**
     * Represents the current player instance. Use this to interact with the player.
     * Player is one slide in the presentation and changes for each slide.
     * 
     * **The player is available just in the player plugin script.**
     */
    player: ApiPlayer;

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
     * Represents the cache for the plugin. Use this to store some data between instances of the plugin.
     * These data are not persisted and can be deleted at any time.
     * The cache is shared between all instances of the current plugin. Other plugins cannot access this cache.
     */
    cache: ApiCache;

    /**
     * The current language of the platform. This is the language that the user has selected in the application.
     * Currently supported languages are 'en-US' and 'cs-CZ'.
     */
    language: string;

    /**
     * Contains the current plugin id.
     */
    plugin: string;

    // TODO:
    // material - way to create & read slides
}

declare global {
    /**
     * The global API object that can be used to interact with the platform.
     */
    var api: Api;
}

export {};