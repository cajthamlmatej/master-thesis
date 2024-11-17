import type {BlockDeserializer} from "@/editor/block/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {TextPlayerBlock} from "@/editor/block/text/TextPlayerBlock";

export class TextBlockDeserializer implements BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const block = new TextEditorBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.content, data.fontSize);

        if (data.locked)
            block.lock();

        block.group = data.group;

        return block;
    }

    deserializePlayer(data: any): PlayerBlock {
        return new TextPlayerBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.content, data.fontSize);
    }
}
