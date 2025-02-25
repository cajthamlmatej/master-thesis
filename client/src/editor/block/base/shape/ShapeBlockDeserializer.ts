import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {ShapeEditorBlock} from "@/editor/block/base/shape/ShapeEditorBlock";
import {ShapePlayerBlock} from "@/editor/block/base/shape/ShapePlayerBlock";

export class ShapeBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new ShapeEditorBlock(base, data.color, data.shape);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new ShapePlayerBlock(base, data.color, data.shape);
    }
}
