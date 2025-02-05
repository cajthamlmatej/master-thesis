import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {WatermarkEditorBlock} from "@/editor/block/watermark/WatermarkEditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {WatermarkPlayerBlock} from "@/editor/block/watermark/WatermarkPlayerBlock";

export class WatermarkBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        return new WatermarkEditorBlock(data.id);
    }

    deserializePlayer(data: any): PlayerBlock {
        return new WatermarkPlayerBlock(data.id);
    }
}
