import {Property} from "@/editor/property/Property";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {sanitizeAttribute} from "@/utils/Sanitize";

export interface Option {
    value: string;
    label: string;
}

/**
 * Represents a select dropdown property for an editor block.
 * Allows the user to choose from a predefined set of options.
 */
export abstract class SelectProperty<T extends EditorBlock = EditorBlock> extends Property<T> {

    private readonly label: string;
    private readonly name: string;
    private readonly options: Option[];

    /**
     * Initializes the property with a sanitized label, name, and options.
     * @param label - The label for the property.
     * @param name - The name/identifier for the property.
     * @param options - The list of selectable options.
     */
    constructor(label: string, name: string, options: Option[]) {
        super();
        this.label = sanitizeAttribute(label);
        this.name = sanitizeAttribute(name);
        this.options = options.map(option => {
            return {
                value: sanitizeAttribute(option.value),
                label: sanitizeAttribute(option.label)
            };
        });
    }

    /**
     * Sets up the DOM structure for the select property and attaches event listeners.
     */
    public override setup(): void {
        this.element.innerHTML = `
            <label for="${this.name}">${this.label}</label>
            <div class="property-content property-content--row">
                <div class="property-data property-data--row">
                    <select data-property="${this.name}" name="${this.name}">
                        ${this.options.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}
                    </select>
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
     * Recalculates and updates the selected value in the dropdown based on external changes.
     */
    public processRecalculateValues() {
        this.recalculateValues((value) => {
            const input = this.element.querySelector<HTMLInputElement>(`[data-property="${this.name}"]`)!;
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
