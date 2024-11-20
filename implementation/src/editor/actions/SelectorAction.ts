import {EditorAction} from "@/editor/actions/EditorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";

export abstract class SelectorAction extends EditorAction {

    public readonly name: string;
    public readonly label: string;
    public readonly icon: string;

    constructor(name: string, label: string, icon: string) {
        super();
        this.name = name;
        this.label = label;
        this.icon = icon;
    }

    abstract isVisible(param: ActionParameters): boolean;

}
