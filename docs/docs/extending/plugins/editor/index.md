# Editor

This section describes how to create a part of plugin for the editor.
The editor code (referenced as `editor.js`) has to export a function that will be called after the editor is created or plugin is loaded.

Following code snippet shows how to create a plugin for the editor:

```javascript
export const initEditor = function () {
    api.log("Editor plugin loaded");
};
```

After that you can access all APIs and methods of [the editor](api.md) and [global API](../api.md).

Mainly you will create a [panel](panel.md) and [custom blocks](custom-blocks.md) for the editor.