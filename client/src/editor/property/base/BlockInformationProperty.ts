import {EditorBlock} from "@/editor/block/EditorBlock";
import {Property} from "@/editor/property/Property";
import {$t} from "@/translation/Translation";

export class BlockInformationProperty<T extends EditorBlock = EditorBlock> extends Property<T> {

    public constructor() {
        super();
    }

    public override setup(): void {
        const seenTypes = new Map<string, number>();

        let thisBlock = "";

        for (let block of this.editorProperty.getEditor().getBlocks()) {
            const type = block.type;

            if (!seenTypes.has(type)) {
                seenTypes.set(type, 0);
            }

            seenTypes.set(type, seenTypes.get(type)! + 1);

            if(block.id === this.blocks[0].id) {
                thisBlock = block.type + " " + seenTypes.get(type);
            }
        }


        this.element.innerHTML = `
            <label>${$t("property.information.label")}</label>
            <div class="property-content">
                <div class="property-data">
                    <code>${this.blocks[0].id}</code>
                </div>
                <div class="property-data">
                    <code>${thisBlock}</code>
                </div>
            </div>
        `;
    }

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    isVisible(): boolean {
        return this.blocks.length === 1;
    }
}
