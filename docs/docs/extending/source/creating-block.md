# Creating block

If creating [Plugin custom block](../plugins/editor/custom-blocks.md) is not enough for you, you can create your own block.
This should be used only if you can't do it with the plugin system.

## Script for creating block

You can make the block foundation by hand but it is easier to use script.
The script will create specified block classes in correct folders and add them to the block list.
The script is located in `scripts/create-client-block.js`.

You can run it with:
```bash
node scripts/create-client-block.js <block-name>
```

Where `<block-name>` is the name of the block you want to create.0
The block name should be in camel case.

It will create the files in folder `client/src/editor/blocks/base/<block-name>`.
See the files in the folder for more information about the files.

## Deserializer

Is used to correctly construct the block from the data.
The deserializer is a class that extends `BlockDeserializer` and implements the `deserializeEdiotr` and `deserializePlayer` methods.

The `deserializeEditor` method is used to create the block in the editor.
The `deserializePlayer` method is used to create the block in the player.

This methods can throw an error if the data is not valid and the block will not be created.

All blocks should have base properties. You can parse them using a `getBaseBlockData` method.


## Editor block

The editor block is a class that extends `EditorBlock`.
It represents the block in the editor.
It is responsible for rendering the block and handling the events.

The super constructor expects the base block data (see [Deserializer](#deserializer)).

For list of method that are available in the block, consult the EditorBlock class.

You have to implement `render`, `editorSupport` and `clone` methods for the basic functionality.

### `render`

The `render` method is used to render the block in the editor.
You can use JS DOM API to create the block.
Set its properties and add event listeners.

This method has to return the block element.

### `editorSupport`

Specifies what functionality the block supports.
For example, if it can be selected, rotated, resized, etc.

### `clone`

The `clone` method is used to create a copy of the block.
It is used when the block is copied and pasted, and other scenarios.

It is a good practice to use prepared `getCloneBase` method to get the base block data.

### Other overridable methods

You can override other methods to customize the block behavior.

- `getProperties` - returns the block properties which user can set in the editor UI.
- `synchronize` - called when the block should be synchronized with new data.
- `getInteractivityProperties` - returns the block properties which user can set for interactivity.
- `canCurrentlyDo` - checks if the block can do the specified action.
- `getContent` - returns inner content of the block which will be correctly scaled when the block is resized.

### Listeners

You can create any method and mark it using [TS Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html).
Use `@BlockEventListener(BlockEvent.<event>)` decorator to mark the method as a listener.
The method will be called when the event is triggered.

Currently supported events are:
- `MOUNTED`
- `UNMOUNTED`
- `CLICKED`
- `ROTATION_STARTED`
- `ROTATION_ENDED`
- `MOVEMENT_STARTED`
- `MOVEMENT_ENDED`
- `RESIZING_STARTED`
- `HOVER_STARTED`
- `HOVER_ENDED`
- `SELECTED`
- `DESELECTED`

For each event you can get specified parameters.
Refer to the `BlockEvent` enum class for more information.

### Serialization

The base editor implements `serialize` method which is used to serialize the block.
If you want to add a custom property to the serialized data, you can mark specified method with `@BlockSerialize(<key>)` decorator.
The key will be available in the serialized data.

## Player block

The player block is a class that extends `PlayerBlock`.
It is very similar to the editor block but it is used in the player.

You also have to implement `render` and `synchronize` methods.

### Interactive properties

The most important part of the player block is the interactive properties.
In editor, you just define the properties and what can be done with them.
In the player you have to implement the logic for them.

Overriding `getInteractiveProperties` method with `change` function will allow you to implement the interactive properties.
In this method you will receive:

- `value`: `string` - the value of the property
- `relative`: `boolean` - if the value is relative, meaning if the new value should be (for example) added to the current value
- `animationData`: `{ 
  duration: number;
  animate: boolean;
  easing: string;
}` - the animation data for the property

In the most basic case you can just set the value to the block and make the CSS do the rest.

But sometimes you will need to make use of 
[`.animate`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) or
[`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) 
to make the animation smooth by yourself.

Good practice is to change the value after the animation is finished and then synchronize the block.

## Serverside

You dont have to do anything on the server side.