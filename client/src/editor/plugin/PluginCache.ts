export class PluginCacheRecord {
    private records: Record<string, any> = {};

    public get(key: string) {
        return this.records[key];
    }

    public set(key: string, value: any) {
        this.records[key] = value;
    }

    public remove(key: string) {
        delete this.records[key];
    }
}

export class PluginCache {
    private plugins: Record<string, PluginCacheRecord> = {};

    public getPluginCache(pluginId: string) {
        if (!this.plugins[pluginId]) {
            this.plugins[pluginId] = new PluginCacheRecord();
        }

        return this.plugins[pluginId];
    }
}
