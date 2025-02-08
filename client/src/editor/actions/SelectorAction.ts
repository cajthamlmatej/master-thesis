import type {ActionParameters} from "@/editor/actions/EditorAction";
import {EditorAction} from "@/editor/actions/EditorAction";

export abstract class SelectorAction extends EditorAction {

    public readonly icon: string;

    constructor(name: string, icon: string) {
        super(name);
        this.icon = icon;
    }

}
