import type EditorSelectorArea from "@/editor/selector/area/EditorSelectorArea";

/**
 * Abstract base class for selector commands.
 * A selector command defines specific actions that can be performed on the selection area.
 */
export abstract class SelectorCommand {

    /**
     * Returns the HTML elements associated with this command.
     * These elements are typically used as handles for user interactions.
     * @returns {HTMLElement | HTMLElement[]} The HTML element(s) for the command.
     */
    abstract getElements(): HTMLElement | HTMLElement[];

    /**
     * Executes the command when triggered by a user interaction.
     * @param event The event that triggered the command (e.g., mouse or touch event).
     * @param element The HTML element associated with the command.
     * @param selectorArea The selector area instance where the command is executed.
     */
    abstract execute(event: Event, element: HTMLElement, selectorArea: EditorSelectorArea): void;

}
