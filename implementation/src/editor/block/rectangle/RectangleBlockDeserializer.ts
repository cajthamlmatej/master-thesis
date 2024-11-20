import type {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {RectangleEditorBlock} from "@/editor/block/rectangle/RectangleEditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {RectanglePlayerBlock} from "@/editor/block/rectangle/RectanglePlayerBlock";

export class RectangleBlockDeserializer implements BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const block = new RectangleEditorBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.color);

        if (data.locked)
            block.lock();

        block.group = data.group;

        return block;
    }

    deserializePlayer(data: any): PlayerBlock {
        return new RectanglePlayerBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.color);
    }
}
