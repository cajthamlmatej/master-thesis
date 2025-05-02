/**
 * Represents a cache record for storing key-value pairs.
 */
export class PluginCacheRecord {
    private records: Record<string, any> = {};

    /**
     * Retrieves a value from the cache by its key.
     * @param key The key of the value to retrieve.
     * @returns The cached value, or undefined if not found.
     */
    public get(key: string) {
        return this.records[key];
    }

    /**
     * Stores a key-value pair in the cache.
     * @param key The key to store the value under.
     * @param value The value to store.
     */
    public set(key: string, value: any) {
        this.records[key] = value;
    }

    /**
     * Removes a key-value pair from the cache.
     * @param key The key of the value to remove.
     */
    public remove(key: string) {
        delete this.records[key];
    }
}

/**
 * Represents a cache for managing plugin-specific data.
 */
export class PluginCache {
    private plugins: Record<string, PluginCacheRecord> = {};

    /**
     * Retrieves the cache record for a specific plugin.
     * If no record exists, a new one is created.
     * @param pluginId The ID of the plugin.
     * @returns The cache record for the plugin.
     */
    public getPluginCache(pluginId: string) {
        if (!this.plugins[pluginId]) {
            this.plugins[pluginId] = new PluginCacheRecord();
        }

        return this.plugins[pluginId];
    }

    /**
     * Clears all plugin cache records.
     */
    clear() {
        this.plugins = {};
    }
}
