/**
 * Enum representing various events that can occur in the editor plugin system.
 */
export enum EditorPluginEvent {
    /**
     * Event triggered when a panel is registered.
     */
    PANEL_REGISTER = "panelRegister",

    /**
     * Event triggered when a message is sent to a panel.
     */
    PANEL_MESSAGE = "panelMessage",

    /**
     * Event triggered when a plugin block is rendered.
     */
    PLUGIN_BLOCK_RENDER = "pluginBlockRender",

    /**
     * Event triggered when a message is sent to a plugin block.
     */
    PLUGIN_BLOCK_MESSAGE = "pluginBlockMessage",

    /**
     * Event triggered when a property of a plugin block changes.
     */
    PLUGIN_BLOCK_PROPERTY_CHANGE = "pluginBlockPropertyChange",

    /**
     * Event triggered to create a custom block.
     */
    CREATE_CUSTOM_BLOCK = "createCustomBlock",
}
