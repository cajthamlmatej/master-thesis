import {Property} from "@/editor/property/Property";
import type {EditorBlock} from "@/editor/block/EditorBlock";

import {v4} from 'uuid';
import {sanitizeAttribute} from "@/utils/Sanitize";

/**
 * Represents a boolean (checkbox) property for an editor block.
 * Provides functionality to render a checkbox and handle its value changes.
 */
export abstract class BooleanProperty<T extends EditorBlock = EditorBlock> extends Property<T> {

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
     * Sets up the DOM structure for the boolean property and attaches event listeners.
     */
    public override setup(): void {
        const id = v4();

        this.element.innerHTML = `
            <div class="property-content property-content--row">
                <div class="property-data property-data--row">
                    <input type="checkbox" id="${id}" data-property="${this.name}">

                    <label for="${id}" class="checkbox-label"></label>

                    <label for="${id}">${this.label}</label>
                </div>
            </div>
        `;

        const input = this.element.querySelector<HTMLInputElement>(`[data-property="${this.name}"]`)!;

        // Provide default values
        this.processRecalculateValues();

        input?.addEventListener('change', () => {
            this.applyValue(input.checked);
        });
    }

    /**
     * Cleans up the DOM structure when the property is destroyed.
     */
    public override destroy(): void {
        this.element.innerHTML = "";
    }

    /**
     * Recalculates and updates the value in the checkbox based on external changes.
     */
    public processRecalculateValues() {
        this.recalculateValues((value) => {
            const input = this.element.querySelector<HTMLInputElement>(`[data-property="${this.name}"]`)!;
            input.checked = value;
        });
    }

    /**
     * Abstract method to recalculate values. Must be implemented by subclasses.
     * @param change - A callback to update the value.
     */
    abstract recalculateValues(change: (value: boolean) => void): void;

    /**
     * Abstract method to apply a new value to the property. Must be implemented by subclasses.
     * @param value - The new value to apply.
     * @returns A boolean indicating whether the value was successfully applied.
     */
    abstract applyValue(value: boolean): boolean;

}
