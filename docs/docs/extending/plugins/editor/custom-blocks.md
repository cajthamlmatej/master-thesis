# Custom blocks

If the pre-defined blocks do not meet your needs, you can create your own custom blocks. 
This is done by creating a new block of type plugin which your plugin will render.

Pre-defined blocks can be [found here](../block).

For custom block to render you need to implement similiar process for player.
Consult [Player documentation](../player) for more information.

## Creating a custom block

To create a custom block, you need to create a block with plugin type.
Each block can define its data and properties, which you can read and modify in your plugin.

Using `data` property you can in reality create many different custom blocks and render them by the spcified property, for example `type` or `name`.

The properties (in property `properties`) are for defining a user interface where user can set the values of the block.
Every type of property is different and has its own set of options.

### Properties

Type of property is set in `type` property of the property object. Every property expects `label` and `name` property, which is used to identify the property in the plugin block.
The `label` property is used to display the name of the property in the user interface.
The `name` property is used to identify the property in the plugin block.

The following types are available:

- `number` - any number (integer or float)
- `text` - any string
- `color` - any color in hex format (e.g. `#ff0000`)
- `boolean` - any boolean value (true or false)
- `select` - any key string of item in the list of options (passed as `options` property)
    - `options` - array of objects with `label` and `value` properties

Changing the property by user will set the key (by `name` property) in the block `data` to the value of the property.

The following example shows how to create a custom block with properties:

`editor.js`:

```javascript
api.editor.addBlock({
    type: 'plugin',
    position: {
        x: 100, // TODO: better to read the editor size
        y: 100
    },
    size: {
        width: 200,
        height: 200
    },
    rotation: 0,
    zIndex: 1000,
    opacity: 1,
    data: {
        name: "Custom block",
        color: "#ff0000" // Default values
    },
    properties: [
        {
            key: 'name',
            label: 'Name',
            type: 'text'
        },
        {
            key: 'color',
            label: 'Background color',
            type: 'color'
        },
    ]
});
```

## Rendering a custom block

Adding a custom plugin block will display empty block in the editor.
For the block to be rendered, you need to implement `on` method in your plugin and listen for `pluginBlockRender` event.
The callback should return a string that represents the HTML content of the block.
You can modify the HTML based on the properties of the block.
Overall this callback is called infrequently - in application modification has to be done using the [Communication](#communication) channel.

Following example shows how to render a custom block:

`editor.js`:


```javascript
export const initEditor = function () {
    api.editor.on("pluginBlockRender", function (block) {
        return `
<style>div { background-color: ${block.data.color}; }</style>

<div><span>${block.data.name ?? "N/A"}</span></div>
`
    });
};
```

## Communication

Plugin blocks can communicate with the plugin using the [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.
This is the main communication channel between the plugin and the block.

Following example shows how to send a message from the block to the plugin:

```html
<button>Click me</button>

<script>
document
    .querySelector("button")
    .addEventListener("click", () => {
        window.parent.postMessage({ target: "script", message: "call" }, "*");
    });
</script>
```

And the plugin can react to the message using the `on` method:

`editor.js`:
```javascript
export const initEditor = function () {
    api.editor.on("pluginBlockMessage", function (block, message) {
        console.log(message);
    });
};
```

And again, creating a simple ping logic:

`editor.js`:
```javascript
export const initEditor = function () {
    api.editor.on("pluginBlockMessage", function (block, message) {
        block.sendMessage(message);
    });
    api.editor.on("pluginBlockRender", function (block) {
        return `
<div id="value">Value</div>

<script>
window.addEventListener("message", function(event) {
    document.querySelector("#value").innerText = event.data.message;
});

window.parent.postMessage({target: "script", message: "sendmessage testing"}, "*");
</script>`
    });
};
```

## Reactive properties

In the basic implementation, the properties are set in the block data and are not reactive.
Respectively when the property is changed, the block is not re-rendered.

It better to announce the property change to the block and it will re-render itself.

The following example shows how to do this:

`editor.js`:
```javascript
export const initEditor = function () {
    api.editor.on("pluginBlockPropertyChange", (block) => {
        block.sendMessage(JSON.stringify(block.data));
    });
    api.editor.on("pluginBlockRender", function (block) {
        return `
<div id="value">${block.data.text}$</div>

<script>
window.addEventListener("message", function(event) { {
    const data = JSON.parse(event.data.message);
    document.querySelector("#value").innerText = data.text;
});
</script>`
    });
};
```