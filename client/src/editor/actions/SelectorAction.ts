import {EditorAction} from "@/editor/actions/EditorAction";

/**
 * Represents an abstract action in the editor that involves selection.
 * This class is extended by specific selection-related actions.
 */
export abstract class SelectorAction extends EditorAction {

    /**
     * The icon associated with the selector action.
     */
    public readonly icon: string;

    /**
     * Creates a new SelectorAction instance.
     * @param name The name of the action.
     * @param icon The icon representing the action.
     */
    constructor(name: string, icon: string) {
        super(name);
        this.icon = icon;
    }

}
