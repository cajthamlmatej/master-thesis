# API

This section describes available API methods for plugins during the editor context.

The API is available in the `api` object in property `api.editor` which is injected by the code runner (see [Security](../security.md) for more details).

## `getBlocks`

**Signature**: `getBlocks(): EditorBlock[]`

Returns an array of all blocks in the editor (slide).
Consult the [Block API](../block.md) for more details about the block types, their properties and methods.

## `addBlock`

**Signature**: `addBlock(block: CreateEditorBlock): string`

Create a specific block in the current slide.
You can create any type of block. 
Consult the [Block API](../block.md) for more details about the block types, their properties and methods.

**Returns**: The ID of the created block.

**Example**:
```javascript
const editor = api.editor;

let centerX = editor.getSize().width / 2;
let centerY = editor.getSize().height / 2;

centerX -= 100;
centerY -= 100;

const id = editor.addBlock({
    type: 'text',
    position: {
        x: centerX,
        y: centerY
    },
    size: {
        width: 200,
        height: 200
    },
    rotation: 0,
    zIndex: 1000,
    opacity: 1,
    content: 'Hello World',
    fontSize: 20,
});
```

For all types of blocks, visit the [Block documentation](../block.md).

## `removeBlock`

**Signature**: `removeBlock(blockId: string): void`

Remove a specific block from the current slide.
If the block is not found, nothing happens.

## `selectBlock`

**Signature**: `selectBlock(blockId: string, addToSelection?: boolean): void`

Select a specific block in the current slide.
If the block is not found, nothing happens.

**Arguments**:
- `blockId` (string): The ID of the block to select.
- `addToSelection` (boolean, optional): If `true`, the block will be added to the current selection. If `false`, the current selection will be cleared and the block will be selected. Defaults to `false`.

## `deselectBlock`

**Signature**: `deselectBlock(blockId: string): void`

Deselect a specific block in the current slide.
If the block is not found, nothing happens.

## `isBlockSelected`

**Signature**: `isBlockSelected(blockId: string): boolean`

Returns `true` if the block is selected, `false` otherwise.
If the block is not found, returns `false`.

## `getMode`

**Signature**: `getMode(): 'select' | 'move';

Return the current mode of the editor.
The mode can be either `select` or `move`.
- `select` mode allows you to select and manipulate blocks.
- `move` mode allows you to move, zoom in the canvas.

## `setMode`

**Signature**: `setMode(mode: 'select' | 'move'): void`

Change the current mode of the editor.

## `getSize`

**Signature**: `getSize(): { width: number; height: number }`

Return the current size of the editor in pixels.

## `setSize`

**Signature**: `setSize(width: number, height: number, resizeToFit: boolean): void`

**Arguments**:
- `width` (number): The new width of the editor in pixels.
- `height` (number): The new height of the editor in pixels.
- `resizeToFit` (boolean): If `true`, the editor blocks will be resized to fit the new size. If `false`, the editor blocks will not be resized.

## `on`

**Signature**: `on(eventName: string, callback: any): void`

Register a callback function to be called when a specific event occurs in the editor.

:::warning

Calling this function multiple times with the same event name will override the previous callback.

:::

Following events are available:

### `pluginBlockRender`

**Signature**: `on('pluginBlockRender', (block: EditorBlock) => string): void`

The callback is called when the editor requests a block to be rendered.
Only requests for this plugin's plugin blocks are sent to this function. 
Can be called for multiple reasons, but has to be the "base evaluation" of the block.
You can continue to communicate with this block using the plugin block's methods.

The callback should return a string that represents the HTML content of the block.
This HTML content will be used to render the block in the editor.

### `panelRegister`

**Signature**: `on('panelRegister', () => string): void`

The callback is called when the editor requests a panel to be rendered for this specific plugin.

The callback should return a string that represents the HTML content of the panel.
This HTML content will be used to render the panel in the editor.

For more panel information, see [Panel documentation](panel.md).

### `panelMessage`

**Signature**: `on('panelMessage', (message: string) => void): void`

The callback is called when this plugin panel requests a message to be sent to the plugin.
This is the main communication channel between the plugin and the panel.

For more panel information, see [Panel documentation](panel.md).

### `pluginBlockMessage`

**Signature**: `on('pluginBlockMessage', (block: EditorBlock, message: string) => void): void`

The callback is called when this plugin block requests a message to be sent to the plugin.
This is the main communication channel between the plugin and the block.

For more information about custom blocks, visit the [Custom block documentation](custom-blocks.md).


### `pluginBlockPropertyChange`

**Signature**: `on('pluginBlockPropertyChange', (block: EditorBlock, property: string) => void): void`

The callback is called when this plugin block's property is changed.
The `property` argument is the name of the property that was changed.

For more information about custom blocks, visit the [Custom block documentation](custom-blocks.md).


### `createCustomBlock`

**Signature**: `on('createCustomBlock', (id: string) => string): void`

The callback is called when user requests a custom block to be created from this plugin that was registered in the editor.
The `id` argument is the custom block ID that you can recognize in your plugin.

For more information about custom blocks, visit the [Custom block documentation](custom-blocks.md).

## `sendPanelMessage`

**Signature**: `sendPanelMessage(message: string): void`

Sends a message to the plugin panel.


For more panel information, see [Panel documentation](panel.md).

## `registerCustomBlock`

**Signature**: `registerCustomBlock(data: { id: string, name: string, icon: string }): void`

Registers a custom block in the editor with specific ID, name and icon.
Icon has to be a valid icon name from the [Material Design Icons](https://materialdesignicons.com/) library.

This custom block will be available in the editor and can be created by the user.
When user creates this custom block, the `createCustomBlock` event will be triggered in the plugin.

For more information about custom blocks, visit the [Custom block documentation](custom-blocks.md).