# Blocks

This section describes what type of blocks you can add to slide using the plugin system.
It also describes their properties and methods, and how to use them.

## Plugin block

**Type**: `plugin`
**Plugin**: string (readonly) - The id of the plugin that created this block.
**Properties**: `array` - todo 

### `sendMessage`

**Signature**: `sendMessage(message: string): void`

A way to send a message to the plugin block from the plugin.

### `render`

**Signature**: `render(): void`

Forces the block to re-render, so essentially caling the callback on the block again.