# Publishing

This document will cover the basics of publishing plugins and how to do it in Materalist.

## Creating a new plugin

Publishing a plugin is a process where you make your plugin available to other users.
The development of plugins can be done in production mode, but it is recommended to use a local server for testing purposes.
How to create a local server is explained in the [Setup](../source/setup) documentation.

Once you are ready to publish your plugin, you can follow these steps:

1. **Log in to your account**: Make sure you are logged in to your account on the application.
2. **Go to the plugin page**: Click on the "Plugins" tab in the left sidebar. There you will see a list of your plugins and it's release versions.
3. **Create a new plugin**: Click on the "Create a new plugin" button. This will open a form where you can enter the details of your plugin. Required fields are:
   - **Name**: The name of your plugin. This will be displayed to users.
   - **Description**: A short description of what your plugin does. This will help users understand the purpose of your plugin. Preferably, this should be a few sentences long in English. But you can use any language you want.
   - **Icon**: An icon for your plugin. This will be displayed next to the name of your plugin. Icons are taken from [Material Design Icons](https://materialdesignicons.com/). You can search for an icon by name or by category. The icon will be displayed in the plugin list and in the plugin settings.
   - **Tags**: Tags are used to categorize your plugin. You can add multiple tags to your plugin. Tags are used to filter plugins in the plugin list. Available tags can be found while creating a plugin.
4. **Review information**: After you have entered all the required information, click on the "Create" button. This will create a new plugin and will refresh the page to show the new plugin in the list. You can now see the plugin details and the release versions of your plugin. If everything is correct, you can proceed to the next step and create a [new release](#creating-a-new-release).

## Releasing a new release

:::warning

Materalist doesn't really have a concept of "releases" in the traditional sense.
A release is just a version of your plugin that is available to users and users can install just the latest version of your plugin.

If you need to have multiple different branches of your plugin, you have to create a new plugin for each branch.

:::

Publishing a new release is a process where you make your plugin available to other users.
If plugin doesnt have any releases, then the plugin is not available for installation.

You can manage your releases in the plugin page within the specific plugin using the `Releases` tab.

Once you are ready to publish a new release, you can follow these steps:

1. **Go to the plugin page**: Click on the "Plugins" tab in the left sidebar. There you will see a list of your plugins and it's release versions.
2. **Select the plugin**: Click on the plugin you want to release a new version of. This will open the plugin page where you can see the details of your plugin and the list of releases.
3. **Create a new release**: Click on the "Create a new release" button. This will open a form where you can enter the details of your release. Required fields are:
   - **Version**: The version of your plugin. This will be displayed to users. The version should be in the format `X.Y.Z`, where `X` is the major version, `Y` is the minor version, and `Z` is the patch version. For example, `1.0.0`.
   - **Changelog**: Release notes are used to describe what has changed in this release. It is used for better understanding of the changes in the plugin for the administrators of Materalist. The changelog should be in the format of a list of changes, with each change on a new line. You can use markdown to format the changelog.
   - **Manifest**: The manifest is a JSON file that describes the plugin and its settings which mostly change what can the plugin do. For more information about the manifest, see the [Manifest](./manifest) documentation.
   - **Editor code**: The editor code is the code that runs in the editor. This is the code that is used to create the plugin. For more information about the editor code, see the [Editor code](./editor) documentation.
    - **Player code**: The player code is the code that runs in the player. This is the code that is used to create the plugin. For more information about the player code, see the [Player code](./player) documentation.
4. **Review information**: After you have entered all the required information, click on the last tab "Review". This will show you a preview of the release and the plugin. If everything is correct, you can proceed to the next step and publish the release. If you can't submit the release, then you have to fix the errors in the form.
5. **Test the release**: After you have published the release, you can test it by using it in a material. Make sure that the plugin release works as expected and that there are no errors in the console.