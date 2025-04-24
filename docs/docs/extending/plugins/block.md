# Blocks

This section describes what type of blocks you can add to slide using the plugin system.
It also describes their properties and methods, and how to use them.

Overall you can change the properties of all blocks, but they will not be synchronized with the editor.
Just calling the methods on the block will result in the changes being applied to the editor.

## Block

Every block has a set of properties and methods that are available everywhere.

- **`id`**: `string` - The id of the block. This is used to identify the block in the editor.
- **`type`**: `string` - The type of the block. The types can be seen in the following sections.
- **`position`**: `object` - The position of the block. This is an object with `x` and `y` properties. The position is relative to the slide from the top left corner. In pixels. 
- **`size`**: `object` - The size of the block. This is an object with `width` and `height` properties. In pixels.
- **`rotation`**: `number` - The rotation of the block. This is the angle in degrees.
- **`zIndex`**: `number` - The z-index of the block. This is used to determine the order of the blocks. The higher the z-index, the higher the block is in the stack.
- **`opacity`**: `number` - The opacity of the block. This is a number between 0 and 1. 0 is fully transparent and 1 is fully opaque.

### `unlock`

**Signature**: `unlock(): void`

Unlocks the block. Lock status means that the block is not editable. Dragging the block will not select it.

### `lock`

**Signature**: `lock(): void`

Locks the block. Lock status means that the block is not editable. Dragging the block will not select it.

### `setZIndex`

**Signature**: `setZIndex(zIndex: number): void`

Changes the z-index of the block. The higher the z-index, the higher the block is in the stack.

### `changeOpacity`

**Signature**: `changeOpacity(opacity: number): void`

Changes the opacity of the block. This is a number between 0 and 1. 0 is fully transparent and 1 is fully opaque.

### `move`

**Signature**: `move(x: number, y: number): void`

Moves the block to the specified position. The position is relative to the slide from the top left corner. In pixels.

### `resize`

**Signature**: `resize(width: number, height: number): void`

Resizes the block to the specified size. The size is in pixels.

### `rotate`

**Signature**: `rotate(angle: number): void`

Rotates the block to the specified angle. The angle is in degrees.

## Plugin block

Represents a custom block that is rendered by a plugin. For more information about creating custom blocks read the [Custom blocks documentation](editor/custom-blocks.md).

:::warning

Property `plugin` is automatically set to the id of the plugin that created this block.

:::

- **`type`**: `plugin`
- **`plugin`**: `string` - The id of the plugin that created this block.
- **`properties`**: `array` - List of properties for the block which user can set in the UI.
- **`data`**: `object` - The data for the block, these are set by plugin or are set by changing the properties in the UI.

### Properties

All properties need following properties:

- `type`: `string` - The type of the property, this is used to determine how to render the property in the UI. 
- `key`: `string` - The key of the property. This is a key which is used to set the value of the property in the data object.
- `label`: `string` - The label of the property. This is used to display the property in the UI.

Several types of properties are available:

- `text`: A text input field.
- `number`: A number input field.
- `boolean`: A checkbox input field.
- `color`: A color input field.
- `select`: A select input field. This type has an additional property `options` which is an array of objects with `label` and `value` properties.

### `sendMessage`

**Signature**: `sendMessage(message: string): void`

A way to send a message to the plugin block from the plugin.

### `render`

**Signature**: `render(): void`

Forces the block to re-render, so essentially caling the callback on the block again.

### `sendRemoteMessage`

**Signature**: `sendRemoteMessage(message: string): void`

Sends message to a remote block. If is a presenter, it is send to all clients. If not, its send just to the presenter.

## Iframe block

Represents a block with a custom HTML content. This block is rendered in an iframe.

- **`type`**: `iframe`
- **`content`**: `string` - The HTML content of the block. User can change this content in the UI.


## Image block

Represents a block with an image. This can mean image from a URL or an user uploaded image.

- **`type`**: `image`
- **`imageUrl`**: `string | undefined` - The URL of the image.
- **`mediaId`**: `string | undefined` - The ID of the image. This is used to identify the image in the media library.
- **`aspectRatio`**: `boolean` - If false, the image will be resized to fit the block. If true, the image will not be resized and will keep its aspect ratio.


## Interactive area block

Represents a block with no rendered content. This block is used to create interactive areas in the slide.

- **`type`**: `interactiveArea`

## Mermaid block

Represents a block with a mermaid diagram. This block is rendered in an iframe. Can render any type of [mermaid diagram](https://mermaid-js.github.io/mermaid/#/).

- **`type`**: `mermaid`
- **`content`**: `string` - The definition of the diagram. This is used to display the diagram in the UI. User can change this content in the UI.

## Shape block

Represents a block with a shape. The shape types are predefined.

- **`type`**: `shape`
- **`shape`**: `string` - ID of the shape. The shape can be one of the following:
    - `ellipse`
    - `rectangle`
    - `triangle`
    - `arrow-1`
    - `egg`
    - `star`
    - `heart`
    - `pentagon`
    - `hexagon`
    - `crescent`
    - `ladder`
- **`color`**: `string` - The color of the shape. In hex format.


## Text block

Represents a block with a text. You can define some basic HTML tags in the text.

- **`type`**: `text`
- **`content`**: `string` - The HTML content of the block. User can change this content in the UI. Allowed HTML tags are:
    - `<b>` - Bold text	
    - `<i>` - Italic text
    - `<u>` - Underlined text
    - `<s>` - Strikethrough text
    - `<sup>` - Superscript text
    - `<sub>` - Subscript text
    - `<ul>` - Unordered list
    - `<ol>` - Ordered list
    - `<li>` - List item
    - `<span>` - Span element
Using CSS you can also change the font size, color and other properties of the text. The following CSS properties are available:
    - `color` - The color of the text. You can use hex color or a color name.
    - `fontFamily` - The font family of the text. You can use any font family that is available in the editor.
    - `fontWeight` - The font weight of the text.
    - `fontSize` - The font size of the text.
    - `text-align` - The text alignment of the text. You can use `left`, `right`, `center` or `justify`.
- **`fontSize`**: `number` - The font size of the text. You also can change this inside the content property. 


<!-- 
## Watermark block
 -->
