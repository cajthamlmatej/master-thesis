import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {ChatPlayerBlock} from "@/editor/block/base/chat/ChatPlayerBlock";
import {ChatEditorBlock} from "@/editor/block/base/chat/ChatEditorBlock";

export class ChatBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new ChatEditorBlock(base);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new ChatPlayerBlock(base);
    }
}