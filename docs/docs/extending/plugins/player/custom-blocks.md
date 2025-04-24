# Custom blocks

For overview what custom blocks are and how editor works with them, please refer to [Custom blocks in editor documentation](../editor/custom-blocks.md).

If material slide has a plugin block, it will be rendered in the player as well. 
Same as in editor, you need ot register a callback for `pluginBlockRender` event in the player and return a string that represents the HTML content of the block.


Following example shows how to render a custom block:

`player.js`:


```javascript
export const initPlayer = function () {
    api.player.on("pluginBlockRender", function (block) {
        return `
<style>div { background-color: ${block.data.color}; }</style>

<div><span>${block.data.name ?? "N/A"}</span></div>`
    });
};
```

Same as in the editor, you can communicate with the plugin (and other way around) using the communication channel.
See [Communication](../editor/custom-blocks.md#communication) for more details.

The player **does not have** something like `pluginBlockPropertyChange` event.
This means that if you change the properties of the block in the player, you need to communicate the changes to the player using the communication channel. 