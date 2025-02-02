import type {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {ShapeEditorBlock} from "@/editor/block/shape/ShapeEditorBlock";
import {ShapePlayerBlock} from "@/editor/block/shape/ShapePlayerBlock";

export class ShapeBlockDeserializer implements BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const block = new ShapeEditorBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.color, data.shape);

        if (data.locked)
            block.lock();

        block.group = data.group;
        block.interactivity = data.interactivity;

        return block;
    }

    deserializePlayer(data: any): PlayerBlock {
        const block = new ShapePlayerBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.color, data.shape);

        block.interactivity = data.interactivity;

        return block;
    }
}
