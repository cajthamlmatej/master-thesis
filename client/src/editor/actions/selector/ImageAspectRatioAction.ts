import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ImageEditorBlock} from "@/editor/block/image/ImageEditorBlock";

export class ImageAspectRatioAction extends SelectorAction {
    constructor() {
        super("image-aspect-ratio", "Fix aspect ratio");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().selection && !b.locked)
            && param.selected.every(b => b.type === "image");
    }

    override run(param: ActionParameters) {
        for (const block of param.selected as ImageEditorBlock[]) {

        }
        param.editor.events.HISTORY.emit();
    }
}
