import {Property} from "@/editor/property/Property";
import type {EditorBlock} from "@/editor/block/EditorBlock";

import {v4} from 'uuid';
import {sanitizeAttribute} from "@/utils/Sanitize";

export abstract class BooleanProperty<T extends EditorBlock = EditorBlock> extends Property<T> {

    private readonly label: string;
    private readonly name: string;

    constructor(label: string, name: string) {
        super();
        this.label = sanitizeAttribute(label);
        this.name = sanitizeAttribute(name);
    }

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

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    public processRecalculateValues() {
        this.recalculateValues((value) => {
            const input = this.element.querySelector<HTMLInputElement>(`[data-property="${this.name}"]`)!;
            input.checked = value;
        });
    }

    abstract recalculateValues(change: (value: boolean) => void): void;

    abstract applyValue(value: boolean): boolean;

}
