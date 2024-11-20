import type Editor from "@/editor/Editor";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {EditorContext} from "@/editor/context/EditorContext";

export interface ActionParameters {
    selected: EditorBlock[];
    editor: Editor;
    position: { x: number, y: number };
}

export abstract class EditorAction {

    abstract run(param: ActionParameters): void;

}
