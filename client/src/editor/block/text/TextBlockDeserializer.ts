import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {TextPlayerBlock} from "@/editor/block/text/TextPlayerBlock";

export class TextBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new TextEditorBlock(base, data.content, data.fontSize);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new TextPlayerBlock(base, data.content, data.fontSize);
    }
}
