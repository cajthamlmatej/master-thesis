import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {MermaidPlayerBlock} from "@/editor/block/mermaid/MermaidPlayerBlock";
import {MermaidEditorBlock} from "@/editor/block/mermaid/MermaidEditorBlock";

export class MermaidBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new MermaidEditorBlock(base, data.content);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new MermaidPlayerBlock(base, data.content);
    }
}
