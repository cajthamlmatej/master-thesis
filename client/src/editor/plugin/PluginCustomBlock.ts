/**
 * Represents a custom block within a plugin.
 */
export interface PluginCustomBlock {
    /**
     * The name of the custom block.
     */
    name: string;

    /**
     * The icon associated with the custom block.
     */
    icon: string;

    /**
     * The unique identifier for the custom block.
     */
    id: string;

    /**
     * The identifier of the plugin this block belongs to.
     */
    pluginId: string;
}
