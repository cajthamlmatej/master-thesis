import type {EditorProperty} from "@/editor/property/EditorProperty";
import {EditorBlock} from "@/editor/block/EditorBlock";

/**
 * Abstract base class representing a property of an editor block.
 * @template T - The type of editor block this property is associated with.
 */
export abstract class Property<T extends EditorBlock = EditorBlock> {
    protected element!: HTMLElement;
    protected editorProperty!: EditorProperty;
    protected blocks!: T[];

    /**
     * Gets the priority of the property. Lower values indicate higher priority.
     * @returns {number} The priority of the property.
     */
    public getPriority(): number {
        return 0;
    }

    /**
     * Initializes the property with the provided element, editor property, and blocks.
     * @param {HTMLElement} element - The HTML element representing the property.
     * @param {EditorProperty} editorProperty - The editor property managing this property.
     * @param {T[]} blocks - The blocks associated with this property.
     */
    public initialize(element: HTMLElement, editorProperty: EditorProperty, blocks: T[]) {
        this.element = element;
        this.editorProperty = editorProperty;
        this.blocks = blocks;
    }

    /**
     * Gets the unique identifier of the property.
     * @returns {string} The unique identifier of the property.
     */
    public getID(): string {
        return this.constructor.name;
    }

    /**
     * Determines whether the property is visible.
     * @returns {boolean} True if the property is visible, otherwise false.
     */
    public abstract isVisible(): boolean;

    /**
     * Sets up the property. This method should be implemented by subclasses.
     */
    public abstract setup(): void;

    /**
     * Cleans up resources used by the property. This method should be implemented by subclasses.
     */
    public abstract destroy(): void;
}
