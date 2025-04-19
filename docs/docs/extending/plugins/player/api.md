# API

This section describes available API methods for plugins during the player context.

The API is available in the `api` object in property `api.player` which is injected by the code runner (see [Security](./security) for more details).

## `getBlocks`

**Signature**: `getBlocks(): PlayerBlock[]`

Returns an array of all blocks in the player (slide).
Consult the [Block API](../block) for more details about the block types, their properties and methods.

## `addBlock`

**Signature**: `addBlock(block: CreatePlayerBlock): string`

Create a specific block in the current slide.
You can create any type of block. 
Consult the [Block API](../block) for more details about the block types, their properties and methods.

**Returns**: The ID of the created block.

## `removeBlock`

**Signature**: `removeBlock(blockId: string): void`

Remove a specific block from the current slide.
If the block is not found, nothing happens.

## `getMode`

**Signature**: `getMode(): 'play' | 'move' | 'draw';

Return the current mode of the player.
The mode can be either `play`, `move` or `draw`.
- `play` the canvas is static and you are able to interact with the blocks.
- `move` mode allows you to move, zoom in the canvas.
- `draw` mode allows you to draw on the canvas.

## `setMode`

**Signature**: `setMode(mode: 'play' | 'move' | 'draw'): void`

Change the current mode of the player.

## `isPresenter`

**Signature**: `isPresenter(): boolean`

Checks if this instance of player is a presenter.

## `on`

**Signature**: `on(eventName: string, callback: any): void`

Register a callback function to be called when a specific event occurs in the player.

:::warning

Calling this function multiple times with the same event name will override the previous callback.

:::

Following events are available:

### `pluginBlockRender`

**Signature**: `on('pluginBlockRender', (block: PlayerBlock) => string): void`

The callback is called when the player requests a block to be rendered.
Only requests for this plugin's plugin blocks are sent to this function. 
Can be called for multiple reasons, but has to be the "base evaluation" of the block.
You can continue to communicate with this block using the plugin block's methods.

The callback should return a string that represents the HTML content of the block.
This HTML content will be used to render the block in the player.

### `pluginBlockMessage`

**Signature**: `on('pluginBlockMessage', (block: PlayerBlock, message: string) => void): void`

The callback is called when this plugin block requests a message to be sent to the plugin.
This is the main communication channel between the plugin and the block.

For more information about custom blocks, visit the [Custom block documentation](../custom-blocks).


### `pluginRemoteMessage`

**Signature**: `on('pluginRemoteMessage', (block: PlayerBlock, message: string, clientId: string | undefined) => void): void`

The callback is called when this plugin block recieved message from some remote block with same id.
The clientId is undefined if this instance of player is a viewer.

For more information about remote communication, visit the [Remote communication documentation](../remote).