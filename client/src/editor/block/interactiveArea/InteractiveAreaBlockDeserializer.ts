import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {InteractiveAreaPlayerBlock} from "@/editor/block/interactiveArea/InteractiveAreaPlayerBlock";
import {InteractiveAreaEditorBlock} from "@/editor/block/interactiveArea/InteractiveAreaEditorBlock";

export class InteractiveAreaBlockDeserializer extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new InteractiveAreaEditorBlock(base);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new InteractiveAreaPlayerBlock(base);
    }
}
