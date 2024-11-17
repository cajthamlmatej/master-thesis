import type {BlockDeserializer} from "@/editor/block/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {ImageEditorBlock} from "@/editor/block/image/ImageEditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {ImagePlayerBlock} from "@/editor/block/image/ImagePlayerBlock";

export class ImageBlockDeserializer implements BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const block = new ImageEditorBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.imageUrl);

        if (data.locked)
            block.lock();

        block.group = data.group;

        return block;
    }

    deserializePlayer(data: any): PlayerBlock {
        return new ImagePlayerBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.imageUrl);
    }
}
