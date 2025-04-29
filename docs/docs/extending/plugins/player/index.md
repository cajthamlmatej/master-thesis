# Player

This section describes how to create a part of plugin for the player.
The player code (referenced as `player.js`) has to export a function that will be called after the player is created or plugin is loaded.

Following code snippet shows how to create a plugin for the player:

```javascript
export const initPlayer = function () {
    api.log("Player plugin loaded");
};
```

After that you can access all APIs and methods of [the player](api.md) and [global API](../api.md).

Mainly you will create a rendering for [custom blocks](custom-blocks.md).