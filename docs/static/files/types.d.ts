interface TextPluginProperty {
    /** Type of the plugin property. Must be 'text'. */
    type: 'text';
    /** Label for the property shown in the editor UI. */
    label: string;
}

interface BooleanPluginProperty {
    /** Type of the plugin property. Must be 'boolean'. */
    type: 'boolean';
    /** Label for the property shown in the editor UI. */
    label: string;
}

interface ColorPluginProperty {
    /** Type of the plugin property. Must be 'color'. */
    type: 'color';
    /** Label for the property shown in the editor UI. */
    label: string;
}

interface NumberPluginProperty {
    /** Type of the plugin property. Must be 'number'. */
    type: 'number';
    /** Label for the property shown in the editor UI. */
    label: string;
}

interface SelectPluginProperty {
    /** Type of the plugin property. Must be 'select'. */
    type: 'select';
    /** Label for the property shown in the editor UI. */
    label: string;
    /** Options available for selection. Each option has a value and a label. */
    options: { value: string; label: string }[];
}

interface PluginPropertyBase {
    /** Type of the plugin property. */
    type: string;
    /** Key used to identify the property in the block data. */
    key: string;
}

/** Union type for all plugin properties. */
type PluginProperty = PluginPropertyBase & (
    | TextPluginProperty
    | BooleanPluginProperty
    | ColorPluginProperty
    | NumberPluginProperty
    | SelectPluginProperty
    );

interface PluginEditorBlock {
    /** Type of the block. Must be 'plugin'. */
    type: 'plugin';
    /** Identifier of the plugin this block belongs to. */
    plugin: string;
    /** Custom data associated with the plugin block. Editable by the user via properties. */
    data: Record<string, string>;
    /** Properties defining the user-editable attributes of the block. */
    properties: PluginProperty[];
}

interface PluginEditorBlockActions {
    /** Sends a message to the plugin block using the communication channel. */
    sendMessage(message: string): void;
    /** Requests the plugin block to re-render itself. */
    render(): void;
}

interface IframeEditorBlock {
    /** Type of the block. Must be 'iframe'. */
    type: 'iframe';
    /** HTML content to display inside the iframe block. */
    content: string;
}

interface ImageEditorBlock {
    /** Type of the block. Must be 'image'. */
    type: 'image';
    /** URL of the image resource. */
    imageUrl: string | undefined;
    /** Media ID of the image if managed by media library. */
    mediaId: string | undefined;
    /** Whether the image should maintain its original aspect ratio. */
    aspectRatio: boolean;
}

interface InteractiveAreaEditorBlock {
    /** Type of the block. Must be 'interactiveArea'. */
    type: 'interactiveArea';
}

interface MermaidEditorBlock {
    /** Type of the block. Must be 'mermaid'. */
    type: 'mermaid';
    /** Mermaid diagram source content. */
    content: string;
}

interface ShapeEditorBlock {
    /** Type of the block. Must be 'shape'. */
    type: 'shape';
    /** Shape identifier (e.g., rectangle, circle). */
    shape: string;
    /** Fill color of the shape in hexadecimal format. */
    color: string;
}

interface TextEditorBlock {
    /** Type of the block. Must be 'text'. */
    type: 'text';
    /** Text content displayed by the block. */
    content: string;
    /** Font size of the text in pixels. */
    fontSize: number;
}

interface WatermarkEditorBlock {
    /** Type of the block. Must be 'watermark'. */
    type: 'watermark';
}

interface EditorBlockBaseData {
    /** Unique ID of the block. */
    id: string;
    /** Block type identifying its purpose and behavior. */
    type: 'plugin' | 'iframe' | 'image' | 'interactiveArea' | 'mermaid' | 'shape' | 'text' | 'watermark';
    /**
     * Position of the block.
     * Represents the top-left corner coordinates on the canvas, in pixels.
     * X is horizontal from the left, Y is vertical from the top.
     */
    position: {
        /** X coordinate in pixels (distance from the left). */
        x: number;
        /** Y coordinate in pixels (distance from the top). */
        y: number;
    };
    /**
     * Size of the block.
     * Represents the dimensions of the block area in pixels.
     */
    size: {
        /** Width of the block in pixels. Must be greater than 0. */
        width: number;
        /** Height of the block in pixels. Must be greater than 0. */
        height: number;
    };
    /**
     * Rotation of the block.
     * Specifies the clockwise rotation in degrees relative to the block's center.
     */
    rotation: number;
    /**
     * Z-index of the block.
     * Defines the stacking order; higher values are drawn above lower ones.
     */
    zIndex: number;
    /**
     * Opacity of the block.
     * Value between 0 (fully transparent) and 1 (fully opaque).
     */
    opacity: number;
}

interface EditorBlockBaseActions {
    /**
     * Unlocks the block. The block can be moved and resized.
     */
    unlock(): void;
    /**
     * Locks the block. The block cannot be moved or resized.
     */
    lock(): void;
    /**
     * Change the z-index of the block. The z-index is used to determine the order of the blocks.
     * @param zIndex The new z-index value.
     */
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
    /**
     * Returns all blocks in the editor slide.
     * @returns An array of blocks in the editor slide.
     */
    getBlocks(): EditorBlock[];
    /**
     * Removes a block from the editor. The block will be removed from the editor and the editor will be updated.
     * If the block is not found, nothing happens.
     * @param id The ID of the block to remove.
     */
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
    /**
     * Selects a block in the editor. The block will be selected and the editor will be updated.
     * If the block is not found, nothing happens.
     * @param id The ID of the block to select.
     * @param addToSelection If true, the block will be added to the current selection. If false, the current selection will be cleared and the block will be selected.
     */
    selectBlock(id: string, addToSelection?: boolean): void;
    /**
     * Deselects a block in the editor. The block will be deselected and the editor will be updated.
     * If the block is not found, nothing happens.
     * @param id The ID of the block to deselect.
     */
    deselectBlock(id: string): void;
    /**
     * Checks if a block is selected in the editor.
     * @param id The ID of the block to check.
     * @returns True if the block is selected, false otherwise.
     */
    isBlockSelected(id: string): boolean;
    /**
     * Returns the mode of the editor.
     * @returns The mode of the editor. Can be 'select' or 'move'. `select` means that the user can select and move blocks. `move` means that the user can only move canvas.
     */
    getMode(): 'select' | 'move';
    /**
     * Sets the mode of the editor. The mode can be 'select' or 'move'.
     * @param mode The mode to set. Can be 'select' or 'move'.
     */
    setMode(mode: 'select' | 'move'): void;
    /**
     * Returns the current size of the editor. The size is in pixels.
     */
    getSize(): { width: number, height: number };
    /**
     * Sets the size of the editor. The size is in pixels.
     * @param width The new width of the editor. Has to be greater than 0.
     * @param height The new height of the editor. Has to be greater than 0.
     * @param resizeToFit If true, all blocks will be resized to fit the new size. If false, the blocks will keep their current size.
     */
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
    /**
     * Calls the callback when the editor want the plugin to render the panel.
     *
     * **Calling this function multiple times will overwrite the previous callback.**
     * @param eventName 'panelRegister'
     * @param callback The returned string should be the HTML content of the panel.
     */
    on(eventName: 'panelRegister', callback: () => string): void;
    /**
     * Calls the callback when the panel send a message to the plugin.
     *
     * **Calling this function multiple times will overwrite the previous callback.**
     * @param eventName 'panelMessage'
     * @param callback Received message from the panel.
     */
    on(eventName: 'panelMessage', callback: (message: string) => void): void;
    /**
     * Calls the callback when this plugin's block sends a message to the plugin.
     *
     * **Calling this function multiple times will overwrite the previous callback.**
     * @param eventName 'pluginBlockMessage'
     * @param callback Received message from the block and the block itself.
     */
    on(eventName: 'pluginBlockMessage', callback: (block: EditorBlockBaseData & EditorBlockBaseActions & PluginEditorBlock & PluginEditorBlockActions, message: string) => void): void;
    /**
     * Calls the callback when a property of a plugin's block changes.
     *
     * **Calling this function multiple times will overwrite the previous callback.**
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
    /**
     * Returns all blocks in the player slide.
     * @returns An array of blocks in the player slide.
     */
    getBlocks(): PlayerBlock[];
    /**
     * Removes a block from the player. The block will be removed from the player and the player will be updated.
     * If the block is not found, nothing happens.
     * @param id The ID of the block to remove.
     */
    removeBlock(id: string): void;
    /**
     * Add a new block to the player. The supplied data has to be in the correct format for the block type.
     * @param block The block data to add to the player.
     * @returns The ID of the newly added block.
     */
    addBlock(block: CreatePlayerBlock): string;
    /**
     * Returns the mode of the player.
     * @returns The mode of the player. Can be 'play', 'move' or 'draw'. `play` means that the user can only play the presentation. `move` means that the user can move the canvas. `draw` means that the user can draw on the canvas.
     */
    getMode(): 'play' | 'move' | 'draw';

    /**
     * Sets the mode of the player. The mode can be 'play', 'move' or 'draw'.
     * @param mode The mode to set. Can be 'play', 'move' or 'draw'.
     */
    setMode(mode: 'play' | 'move' | 'draw'): void;
    /**
     * Calls the callback when this plugin's block sends a message to the plugin.
     *
     * **Calling this function multiple times will overwrite the previous callback.**
     * @param eventName 'pluginBlockMessage'
     * @param callback Received message from the block and the block itself.
     */
    on(eventName: 'pluginBlockMessage', callback: (block: FullPlayerBlock, message: string) => void): void;
    /**
     * Calls the callback when the Pplayer requests a block to be rendered.
     * Only requests for this plugin's plugin blocks are sent to this function.
     * Can be called for multiple reasons, but has to be the "base evaluation" of the block.
     * You can continue to communicate with this block using the plugin block's methods.
     *
     * **Calling this function multiple times will overwrite the previous callback.**
     * @param eventName 'blockRender'
     * @param callback The returned string should be the HTML content of the block.
     */
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
    /**
     * Get a value from the cache. Returns null if the key does not exist.
     * @param key The key to get the value for.
     * @return The value for the key, or null if the key does not exist.
     */
    get(key: string): string | null;
    
    /**
     * Set a value in the cache. If the key already exists, the value will be overwritten.
     * The value is not persisted and can be deleted at any time.
     * @param key The key to set the value for.
     * @param value The value to set for the key.
     */
    set(key: string, value: string): void;

    /**
     * Remove a value from the cache. If the key does not exist, nothing happens.
     * @param key The key to remove from the cache.
     */
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
}

declare global {
    /**
     * The global API object that can be used to interact with the platform.
     */
    var api: Api;
}

export {};