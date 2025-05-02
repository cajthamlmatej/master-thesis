import type Editor from "@/editor/Editor";
import type {EditorBlock} from "@/editor/block/EditorBlock";

/**
 * Parameters passed to an editor action when it is executed.
 */
export interface ActionParameters {
    /**
     * The currently selected blocks in the editor.
     */
    selected: EditorBlock[];

    /**
     * The editor instance where the action is executed.
     */
    editor: Editor;

    /**
     * The position where the action is triggered.
     */
    position: { x: number, y: number };

    /**
     * Optional keybind information associated with the action.
     */
    keybind?: {
        key: string;
        ctrlKey: boolean;
        shiftKey: boolean;
        altKey: boolean;
    }
}

/**
 * Defines the keybind configuration for an editor action.
 */
export interface ActionKeybind {
    /**
     * The key associated with the action.
     */
    key: string;

    /**
     * Specifies whether the Ctrl key is required, optional, or never used.
     */
    ctrlKey: 'ALWAYS' | 'NEVER' | 'OPTIONAL';

    /**
     * Specifies whether the Shift key is required, optional, or never used.
     */
    shiftKey: 'ALWAYS' | 'NEVER' | 'OPTIONAL';

    /**
     * Specifies whether the Alt key is required, optional, or never used.
     */
    altKey: 'ALWAYS' | 'NEVER' | 'OPTIONAL';

    /**
     * Whether the keybind should capture the event.
     */
    capture?: boolean;

    /**
     * The mode in which the keybind is active and will call the action's run method.
     */
    mode: 'ALWAYS' | 'WHEN_VISIBLE' | 'COULD_BE_VISIBLE';
}

/**
 * Represents an abstract action in the editor.
 * This class is extended by specific actions to define their behavior.
 */
export abstract class EditorAction {

    /**
     * The name of the action.
     */
    public readonly name: string;

    /**
     * Creates a new EditorAction instance.
     * @param name The name of the action.
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Executes the action with the given parameters.
     * @param param The parameters for the action.
     */
    abstract run(param: ActionParameters): void;

    /**
     * Determines if the action is visible with the given parameters.
     * @param param The parameters for the action.
     */
    abstract isVisible(param: ActionParameters): boolean;

    /**
     * Returns the keybinds associated with the action.
     * These keybinds will be registered in the editor.
     * @returns An array of keybind configurations.
     */
    public getKeybinds(): ActionKeybind[] {
        return [];
    }
}
