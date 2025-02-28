import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {PluginPlayerBlock} from "@/editor/block/base/plugin/PluginPlayerBlock";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";

export class PluginBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new PluginEditorBlock(base, data.plugin, data.data, data.properties);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new PluginPlayerBlock(base);
    }
}
