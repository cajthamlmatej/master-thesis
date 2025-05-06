import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {CodePlayerBlock} from "@/editor/block/base/code/CodePlayerBlock";
import {CodeEditorBlock} from "@/editor/block/base/code/CodeEditorBlock";

export class CodeBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new CodeEditorBlock(base, data.content, data.lines, data.language);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new CodePlayerBlock(base, data.content, data.lines, data.language);
    }
}
