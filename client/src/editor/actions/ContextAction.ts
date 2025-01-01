import type {ActionParameters} from "@/editor/actions/EditorAction";
import {EditorAction} from "@/editor/actions/EditorAction";

export abstract class ContextAction extends EditorAction {

    public readonly name: string;
    public readonly label: string;

    constructor(name: string, label: string) {
        super();
        this.name = name;
        this.label = label;
    }

    abstract isVisible(param: ActionParameters): boolean;

}
