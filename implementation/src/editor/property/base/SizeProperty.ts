import {Property} from "@/editor/property/Property";

export class SizeProperty extends Property {

    public override isVisible(): boolean {
        return this.blocks.length === 1;
    }

    public override setup(): void {
        this.element.innerHTML = `
            <p class="label">Size</p>
            <div class="property-content property-content--row">
                <div class="property-data property-data--row">
                    <label for="width">W</label>
                    <input type="number" data-property="width" name="width">
                </div>
                <div class="property-data property-data--row">
                    <label for="height">H</label>
                    <input type="number" data-property="height" name="height">
                </div>
            </div>
        `;

        const widthInput = this.element.querySelector<HTMLInputElement>('[data-property="width"]');
        const heightInput = this.element.querySelector<HTMLInputElement>('[data-property="height"]');

        this.recalculateValues(widthInput, heightInput);

        widthInput?.addEventListener('input', () => {
            for (let block of this.blocks) {
                block.resize(parseInt(widthInput!.value), block.size.height, false, true);
            }
        });
        heightInput?.addEventListener('input', () => {
            for (let block of this.blocks) {
                block.resize(block.size.width, parseInt(heightInput!.value), false, true);
            }
        });

        this.editorProperty.getEditor().events.BLOCK_SIZE_CHANGED.on((data) => {
            this.recalculateValues(widthInput, heightInput);
        });

        const widthLabel = this.element.querySelector<HTMLLabelElement>('label[for="width"]')!;
        const heightLabel = this.element.querySelector<HTMLLabelElement>('label[for="height"]')!;

        this.lockOnElement(widthLabel, (changeX, changeY) => {
            let resizeSuccess = true;
            for (let block of this.blocks) {
                const newWidth = block.size.width + changeX;
                const newHeight = block.size.height + changeY;

                // Check resize constraints
                if (newWidth < 1 || newHeight < 1) {
                    resizeSuccess = false;
                    break;
                }

                block.resize(newWidth, block.size.height, false, true);
            }

            this.recalculateValues(widthInput, heightInput);

            return resizeSuccess;
        });
        this.lockOnElement(heightLabel, (changeX, changeY) => {
            let resizeSuccess = true;
            for (let block of this.blocks) {
                const newWidth = block.size.width + changeX;
                const newHeight = block.size.height + changeY;

                // Check resize constraints
                if (newWidth < 1 || newHeight < 1) {
                    resizeSuccess = false;
                    break;
                }

                block.resize(block.size.width, newHeight, false, true);
            }

            this.recalculateValues(widthInput, heightInput);

            return resizeSuccess;
        });
    }

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    private recalculateValues(widthInput: HTMLInputElement | null, heightInput: HTMLInputElement | null) {
        let defaultWidth: string | number = this.blocks[0].size.width;
        let defaultHeight: string | number = this.blocks[0].size.height;

        if (!this.blocks.every(block => block.size.width === defaultWidth)) {
            defaultWidth = "";
        }
        if (!this.blocks.every(block => block.size.height === defaultHeight)) {
            defaultHeight = "";
        }

        widthInput!.value = defaultWidth.toString();
        heightInput!.value = defaultHeight.toString();
    }
}
