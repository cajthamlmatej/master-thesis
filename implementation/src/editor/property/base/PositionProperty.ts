import {Property} from "@/editor/property/Property";

export class PositionProperty extends Property {

    public override isVisible(): boolean {
        return this.blocks.length === 1;
    }

    public override setup(): void {
        this.element.innerHTML = `
            <p class="label">Position</p>
            <div class="property-content property-content--row">
                <div class="property-data property-data--row">
                    <label for="x">X</label>
                    <input type="number" data-property="x" name="x">
                </div>
                <div class="property-data property-data--row">
                    <label for="y">Y</label>
                    <input type="number" data-property="y" name="y">
                </div>
            </div>
        `;

        const xInput = this.element.querySelector<HTMLInputElement>('[data-property="x"]');
        const yInput = this.element.querySelector<HTMLInputElement>('[data-property="y"]');

        // Default values
        this.recalculateValues(xInput, yInput);

        xInput?.addEventListener('input', () => {
            for (let block of this.blocks) {
                block.move(parseInt(xInput!.value), block.position.y, false, true);
            }
        });
        yInput?.addEventListener('input', () => {
            for (let block of this.blocks) {
                block.move(block.position.x, parseInt(yInput!.value), false, true);
            }
        });

        this.editorProperty.getEditor().events.BLOCK_POSITION_CHANGED.on((data) => {
            this.recalculateValues(xInput, yInput);
        });


        const xLabel = this.element.querySelector<HTMLLabelElement>('label[for="x"]')!;
        const yLabel = this.element.querySelector<HTMLLabelElement>('label[for="y"]')!;

        this.editorProperty.lockOnElement(xLabel, (changeX, changeY) => {
            for (let block of this.blocks) {
                block.move(block.position.x + changeX, block.position.y, false, true);
            }

            this.recalculateValues(xInput, yInput);
            return true;
        });
        this.editorProperty.lockOnElement(yLabel, (changeX, changeY) => {
            for (let block of this.blocks) {
                block.move(block.position.x, block.position.y + changeX, false, true);
            }

            this.recalculateValues(xInput, yInput);
            return true;
        });
    }

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    private recalculateValues(xInput: HTMLInputElement | null, yInput: HTMLInputElement | null) {
        let defaultX: string | number = this.blocks[0].position.x;
        let defaultY: string | number = this.blocks[0].position.y;

        if (!this.blocks.every(block => block.position.x === defaultX)) {
            defaultX = "";
        }
        if (!this.blocks.every(block => block.position.y === defaultY)) {
            defaultY = "";
        }

        xInput!.value = defaultX.toString();
        yInput!.value = defaultY.toString();
    }
}
