import {Property} from "@/editor/property/Property";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {sanitizeAttribute} from "@/utils/Sanitize";

/**
 * Represents a text-based property for an editor block.
 * Provides functionality to render a textarea and handle its value changes.
 */
export abstract class TextProperty<T extends EditorBlock = EditorBlock> extends Property<T> {

    private readonly label: string;
    private readonly name: string;

    /**
     * Initializes the property with a sanitized label and name.
     * @param label - The label for the property.
     * @param name - The name/identifier for the property.
     */
    constructor(label: string, name: string) {
        super();
        this.label = sanitizeAttribute(label);
        this.name = sanitizeAttribute(name);
    }

    /**
     * Sets up the DOM structure for the text property and attaches event listeners.
     */
    public override setup(): void {
        this.element.innerHTML = `
            <label for="${this.name}">${this.label}</label>
            <div class="property-content property-content--row">
                <div class="property-data property-data--row">
                    <textarea data-property="${this.name}" name="${this.name}"></textarea>
                </div>
            </div>
        `;

        const input = this.element.querySelector<HTMLInputElement>(`[data-property="${this.name}"]`)!;

        // Provide default values
        this.processRecalculateValues();

        input?.addEventListener('input', () => {
            this.applyValue(input.value);
        });
    }

    /**
     * Cleans up the DOM structure when the property is destroyed.
     */
    public override destroy(): void {
        this.element.innerHTML = "";
    }

    /**
     * Recalculates and updates the values in the textarea based on external changes.
     */
    public processRecalculateValues() {
        this.recalculateValues((value) => {
            const input = this.element.querySelector<HTMLInputElement>(`[data-property="${this.name}"]`)!;

            if (value == undefined) {
                value = "";
            }

            input.value = value.toString();
        });
    }

    /**
     * Abstract method to recalculate values. Must be implemented by subclasses.
     * @param change - A callback to update the value.
     */
    abstract recalculateValues(change: (value: string) => void): void;

    /**
     * Abstract method to apply a new value to the property. Must be implemented by subclasses.
     * @param value - The new value to apply.
     * @returns A boolean indicating whether the value was successfully applied.
     */
    abstract applyValue(value: string): boolean;

}
