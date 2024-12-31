import {Property} from "@/editor/property/Property";

export class RotationProperty extends Property {

    public override isVisible(): boolean {
        return true;
    }

    public override setup(): void {
        this.element.innerHTML = `
            <p class="label">Rotation</p>
            <div class="property-content property-content--row">
                <div class="property-data property-data--row">
                    <input type="number" data-property="rotation" name="rotation">
                </div>
            </div>
        `;

        const rotationInput = this.element.querySelector<HTMLInputElement>('[data-property="rotation"]');

        // Default values
        this.recalculateValues(rotationInput);

        rotationInput?.addEventListener('input', () => {
            let degrees = parseFloat(rotationInput!.value) % 360;

            for (let block of this.blocks) {
                block.rotate(degrees, false, true);
            }
        });

        this.editorProperty.getEditor().events.BLOCK_ROTATION_CHANGED.on((data) => {
            if(data.manual)
                return;

            this.recalculateValues(rotationInput);
        });

        const label = this.element.querySelector<HTMLLabelElement>('.label')!;
        this.editorProperty.lockOnElement(label, (changeX, changeY) => {
            for (let block of this.blocks) {
                block.rotate((block.rotation + changeX) % 360, false, true);
            }

            this.recalculateValues(rotationInput);
            return true;
        });
    }

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    private recalculateValues(rotationInput: HTMLInputElement | null) {
        let defaultRotation: number = this.blocks[0].rotation;

        if (!this.blocks.every(block => block.rotation == defaultRotation)) {
            defaultRotation = 0;
        }

        rotationInput!.value = defaultRotation.toFixed(2).toString();
    }
}
