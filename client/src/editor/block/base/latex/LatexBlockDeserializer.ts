import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {LatexPlayerBlock} from "@/editor/block/base/latex/LatexPlayerBlock";
import {LatexEditorBlock} from "@/editor/block/base/latex/LatexEditorBlock";

export class LatexBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new LatexEditorBlock(base, data.content);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new LatexPlayerBlock(base, data.content);
    }
}
