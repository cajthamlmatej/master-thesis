# First steps

Before you can do anything with plugins in Materalist, you need to learn a few things:

- [Materalist](../../usage/index), which explains how to use Materalist and what it is. You should be familiar with the basics of Materalist before you start creating plugins.
- [Plugin philosophy](./philosophy), which explains how plugins work and what they are, what you can do and what you can't do.
- [Plugin security](./security), which explains how **we make** sure that plugins are safe to use.

Then you can start creating your first plugin. This documentation will help you understand how to do that.

## Creating a new plugin

All plugins can have a [Editor code](./editor) or/and a [Player code](./player) code.
The Editor code is the code that runs in the editor and can be used to create and edit the content of the material.
The Player code is the code that runs in the player while the material is being played (watched, presented, etc.).
You can create a plugin that only has one of them, or both of them.

## Step-by-step guide

:::info

This is very beginner-friendly guide to creating a plugin.
It will help you understand how to create a plugin from scratch and what each part of the plugin does.
If you are already familiar with creating files, you can go to [Prepared plugin base](#prepared-plugin-base) and start creating your plugin from there.

:::

### 1. Create a new folder

In some folder of your computer, create a new folder with some name, for example `my-plugin`.

### 2. Create a new files

In the folder you just created, create a new files:

- `manifest.json`
- `editor.js`
- `player.js`

#### 2.1. `manifest.json`

This file contains the metadata of the plugin which modifies what Materalist does with the plugin and what plugin can do.
Current version of the metadata format is `1`.
To learn what you can do with the metadata, check the [Plugin metadata](./metadata) documentation.

The base of the file could look like this:

```json
{"manifest":1}
```

#### 2.2. `editor.js`

This file contains the code that runs in the editor.
If your plugin does not interact with the editor, you can skip this file.

The base of the file could look like this:

```javascript
export const initEditor = function() {
    api.log("Hello from the editor!");
};
```

#### 2.3. `player.js`

This file contains the code that runs in the player.
If your plugin does not interact with the player, you can skip this file.

The base of the file could look like this:

```javascript
export const initPlayer = function() {
    api.log("Hello from the player!");
};
```

### 3. Initialize types

For better development experience, you can initialize types for the plugin.
The types will help you understand what the code can do.
Your IDE has to support TypeScript for this to work.
Then your IDE will do type checking and autocompletion for you.

In the root of your plugin, upload a file called `types.d.ts` which can be found [here](pathname:///files/types.d.ts).

Your IDE may require you to setup `jsconfig.json`. 
The file may look like follows:

```json
{
    "compilerOptions": {
        "checkJs": true,
        "allowJs": true,
        "maxNodeModuleJsDepth": 2,
        "noEmit": true,
        "moduleResolution": "node",
        "baseUrl": ".",
        "paths": {
            "*": ["types.d.ts"]
        },
        "lib": ["ES2024"]
    },
    "include": ["**/*.js", "types.d.ts"],
    "exclude": ["node_modules"]
}
```

### 4. Testing and publishing

For testing purposes you can use a local server of the application.
How to do that is explained in the [Setup](../../usage/setup) documentation.

But you can really make a test version and publish it and test it on live version.
Then you can use the [Publishing](./publishing) documentation to learn how to publish your plugin.

[//]: # (You can mark the plugin as `unlisted` so it will not be visible to other users.)

## Prepared plugin base

If you want to skip the steps above, you can use the prepared plugin base.
You can download it [here](pathname:///files/plugin-base.zip).

## Next steps

After you got your first plugin working (seeing the logs in the console), you can start creating more complex plugins.
For player side, you can see the [Player code](./player) documentation.
For editor side, you can see the [Editor code](./editor) documentation.

In the code you can access plugin API which is explained in the [Plugin API](./api) documentation.

## Examples

You can find some examples of plugins in the [Examples](./examples) documentation.