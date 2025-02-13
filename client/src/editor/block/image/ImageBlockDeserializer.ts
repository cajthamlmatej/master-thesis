import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {ImageEditorBlock} from "@/editor/block/image/ImageEditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {ImagePlayerBlock} from "@/editor/block/image/ImagePlayerBlock";

export class ImageBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new ImageEditorBlock(base, data.aspectRatio, data.imageUrl, data.mediaId);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new ImagePlayerBlock(base, data.imageUrl, data.mediaId);
    }
}
