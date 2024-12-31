import {Property} from "@/editor/property/Property";
import type {EditorBlock} from "@/editor/block/EditorBlock";

export interface Option {
    value: string;
    label: string;
}

// TODO: allow for multiple selections
export abstract class SelectProperty<T extends EditorBlock = EditorBlock> extends Property<T> {

    private readonly label: string;
    private readonly name: string;
    private readonly options: Option[];

    constructor(label: string, name: string, options: Option[]) {
        super();
        this.label = label;
        this.name = name;
        this.options = options;
    }

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

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    public processRecalculateValues() {
        this.recalculateValues((value) => {
            const input = this.element.querySelector<HTMLInputElement>(`[data-property="${this.name}"]`)!;
            input.value = value.toString();
        });
    }

    abstract recalculateValues(change: (value: string) => void): void;
    abstract applyValue(value: string): boolean;

}
