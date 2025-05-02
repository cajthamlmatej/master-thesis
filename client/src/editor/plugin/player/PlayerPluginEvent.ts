/**
 * Enum representing various events that can occur in the PlayerPlugin.
 */
export enum PlayerPluginEvent {
    /**
     * Event triggered when a plugin block is rendered.
     */
    PLUGIN_BLOCK_RENDER = "pluginBlockRender",

    /**
     * Event triggered when a message is sent to a plugin block.
     */
    PLUGIN_BLOCK_MESSAGE = "pluginBlockMessage",

    /**
     * Event triggered when a remote message is received.
     */
    PLUGIN_REMOTE_MESSAGE = "pluginRemoteMessage",
}
