import {Property} from "@/editor/property/Property";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {sanitizeAttribute} from "@/utils/Sanitize";

/**
 * Represents a numeric property for an editor block.
 * Provides functionality to render a number input and handle its value changes.
 */
export abstract class NumberProperty<T extends EditorBlock = EditorBlock> extends Property<T> {

    private readonly label: string;
    private readonly name: string;

    /**
     * Initializes the property with a sanitized label and name.
     * @param label - The label for the property.
     * @param name - The name/identifier for the property.
     */
    public constructor(label: string, name: string) {
        super();
        this.label = sanitizeAttribute(label);
        this.name = sanitizeAttribute(name);
    }

    /**
     * Sets up the DOM structure for the number property and attaches event listeners.
     */
    public override setup(): void {
        this.element.innerHTML = `
            <label for="${this.name}">${this.label}</label>
            <div class="property-content property-content--row">
                <div class="property-data property-data--row">
                    <input type="number" data-property="${this.name}" name="${this.name}">
                </div>
            </div>
        `;
        const input = this.element.querySelector<HTMLInputElement>(`[data-property="${this.name}"]`)!;

        // Provide default values
        this.processRecalculateValues();

        input?.addEventListener('input', () => {
            this.applyValue(Number(input!.value));
        });

        const label = this.element.querySelector<HTMLLabelElement>('label')!;
        this.editorProperty.lockOnElement(label, (changeX, changeY, distance) => {
            const result = this.applyValue(0, {changeX, changeY, distance});

            this.processRecalculateValues();
            return result;
        });
    }

    /**
     * Cleans up the DOM structure when the property is destroyed.
     */
    public override destroy(): void {
        this.element.innerHTML = "";
    }

    /**
     * Recalculates and updates the value in the number input based on external changes.
     */
    public processRecalculateValues() {
        this.recalculateValues((value) => {
            const input = this.element.querySelector<HTMLInputElement>(`[data-property="${this.name}"]`)!;
            input.value = (value ?? 0).toString();
        });
    }

    /**
     * Abstract method to recalculate values. Must be implemented by subclasses.
     * @param change - A callback to update the value.
     */
    abstract recalculateValues(change: (value: number) => void): void;

    /**
     * Abstract method to apply a new value to the property. Must be implemented by subclasses.
     * @param value - The new value to apply.
     * @param delta - Optional delta values for advanced interactions.
     * @returns A boolean indicating whether the value was successfully applied.
     */
    abstract applyValue(value: number, delta?: { changeX: number, changeY: number, distance: number }): boolean;
}
