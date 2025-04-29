import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {IframePlayerBlock} from "@/editor/block/base/iframe/IframePlayerBlock";
import {IframeEditorBlock} from "@/editor/block/base/iframe/IframeEditorBlock";

export class IframeBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new IframeEditorBlock(base, data.content);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new IframePlayerBlock(base, data.content);
    }
}
