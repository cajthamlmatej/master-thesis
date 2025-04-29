import type Editor from "@/editor/Editor";
import type {EditorBlock} from "@/editor/block/EditorBlock";

export interface ActionParameters {
    selected: EditorBlock[];
    editor: Editor;
    position: { x: number, y: number };
    keybind?: {
        key: string;
        ctrlKey: boolean;
        shiftKey: boolean;
        altKey: boolean;
    }
}

export interface ActionKeybind {
    key: string;
    ctrlKey: 'ALWAYS' | 'NEVER' | 'OPTIONAL';
    shiftKey: 'ALWAYS' | 'NEVER' | 'OPTIONAL';
    altKey: 'ALWAYS' | 'NEVER' | 'OPTIONAL';

    capture?: boolean;

    /**
     * The mode in which the keybind is active and will call the action's run method.
     */
    mode: 'ALWAYS' | 'WHEN_VISIBLE' | 'COULD_BE_VISIBLE';
}

export abstract class EditorAction {

    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Run the action with the given parameters.
     * @param param The parameters for the action.
     */
    abstract run(param: ActionParameters): void;

    /**
     * Check if the action is visible with the given parameters.
     * @param param
     */
    abstract isVisible(param: ActionParameters): boolean;

    /**
     * Returned keybinds will be registered in the editor.
     * Any changes to the keybinds will not be reflected in the editor.
     */
    public getKeybinds(): ActionKeybind[] {
        return [];
    }

}
