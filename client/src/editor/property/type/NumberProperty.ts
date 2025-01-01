import {Property} from "@/editor/property/Property";
import type {EditorBlock} from "@/editor/block/EditorBlock";
export abstract class NumberProperty<T extends EditorBlock = EditorBlock> extends Property<T> {

    private readonly label: string;
    private readonly name: string;

    public constructor(label: string, name: string) {
        super();
        this.label = label;
        this.name = name;
    }

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
            const result = this.applyValue(0, { changeX, changeY, distance });

            this.processRecalculateValues();
            return result;
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

    abstract recalculateValues(change: (value: number) => void): void;
    abstract applyValue(value: number, delta?: { changeX: number, changeY: number, distance: number }): boolean;
}
