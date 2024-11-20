import {Property} from "@/editor/property/Property";

export class ColorProperty extends Property {
    private field: string;

    constructor(field: string) {
        super();
        this.field = field;
    }


    getID(): string {
        return super.getID() + "-" + this.field;
    }

    public override isVisible(): boolean {
        return this.blocks.every(block => this.field in block);
    }

    public override setup(): void {
        this.element.innerHTML = `
            <p class="label">Color</p>
            <div class="property-content property-content--row">
                <div class="property-data property-data--row">
                    <input type="color" data-property="color" name="color">
                </div>
            </div>
        `;

        const colorInput = this.element.querySelector<HTMLInputElement>('[data-property="color"]');

        // Default values
        this.recalculateValues(colorInput);

        colorInput?.addEventListener('input', () => {
            for (let block of this.blocks) {
                (block as any)[this.field] = colorInput!.value;
                (block as any).synchronize();
            }
        });
    }

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    private recalculateValues(colorInput: HTMLInputElement | null) {
        for (let block of this.blocks) {
            if ((block as any)[this.field] !== (this.blocks[0] as any)[this.field]) {
                colorInput!.value = "#ffffff";
                return;
            }
            colorInput!.value = (block as any)[this.field];
        }
    }
}
