# Panel

Panel is a UI component that is used to display information controlled by the plugin.
It can be used to display information about the plugin, or to provide a way for the user to interact with the plugin. 
The panel is displayed in the editor and can be opened and closed by the user.

Every plugin can have none or one panel.
The panel is registered by using [Editor API callback](./api#pluginblockrender).
It can contain any HTML element and can be styled using CSS.
It is rendered as an iframe (for more information see [Security](../security)).

## Communication with plugin

The panel can communicate with the plugin using the [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.
The plugin can use [sendPanelMessage](./api#sendpanelmessage) to send a message to the panel.

The following example shows how to send a message to the plugin from the panel:

```html
<button>Call</button>
<p id="value">Value</p>

<script>
document
    .querySelector("button")
    .addEventListener("click", () => {
        window.parent.postMessage({ target: "script", message: "call" }, "*");
    });
</script>
```

The message in the `postMessage` function is an string that will be sent to the plugin.
Target is currently only `script`.

The panel can listen for the message using the `window.addEventListener` function.

```javascript
window.addEventListener("message", function(event) {
    document.querySelector("#value").innerText = event.data.message;
});
```

The plugin can implement sample ping logic. The plugin will wait a message from the panel and will respond with a message back to the panel.
The panel will display the message received from the plugin.

`editor.js`:
```javascript
export const initEditor = function() {
    api.editor.on("panelMessage", onPanelMessage);
    api.editor.on("panelRegister", onPanelRegister);
};

const onPanelMessage = function(message) {
    api.editor.sendPanelMessage(message);
};

const onPanelRegister = function() {
    return `
<button>Call</button>
<p id="value">Value</p>

<script>
document
    .querySelector("button")
    .addEventListener("click", () => {
        window.parent.postMessage({ target: "script", message: "call" }, "*");
    });

window.addEventListener("message", function(event) {
    document.querySelector("#value").innerText = event.data.message;
});
</script>`;
};
```