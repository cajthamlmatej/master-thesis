import {AggregatorProperty} from "@/editor/property/type/AggregatorProperty";
import {NumberProperty} from "@/editor/property/type/NumberProperty";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {$t} from "@/translation/Translation";

export class PositionProperty<T extends EditorBlock = EditorBlock> extends AggregatorProperty<T> {


    constructor() {
        super($t("property.position.label"), [
            class XProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

                constructor() {
                    super($t("property.position.x"), "base-position-x");
                }

                public override isVisible(): boolean {
                    return true;
                }

                public override setup(): void {
                    super.setup();

                    this.editorProperty.getEditor().events.BLOCK_POSITION_CHANGED.on((data) => {
                        this.processRecalculateValues();
                    });
                }

                public override recalculateValues(change: (value: number) => void): void {
                    let defaultX: string | number = this.blocks[0].position.x;

                    if (!this.blocks.every(block => block.position.x === defaultX)) {
                        defaultX = "";
                    }

                    change(defaultX as number);
                }

                public override applyValue(value: number, delta?: {
                    changeX: number,
                    changeY: number,
                    distance: number
                }): boolean {
                    if (delta) {
                        for (let block of this.blocks) {
                            block.move(block.position.x + delta.changeX, block.position.y, false, true);
                        }
                    } else {
                        for (let block of this.blocks) {
                            block.move(value, block.position.y, false, true);
                        }
                    }

                    return true;
                }
            },
            class YProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

                constructor() {
                    super($t("property.position.y"), "base-position-y");
                }

                public override isVisible(): boolean {
                    return true;
                }

                public override setup(): void {
                    super.setup();

                    this.editorProperty.getEditor().events.BLOCK_POSITION_CHANGED.on((data) => {
                        this.processRecalculateValues();
                    });
                }

                public override recalculateValues(change: (value: number) => void): void {
                    let defaultY: string | number = this.blocks[0].position.y;

                    if (!this.blocks.every(block => block.position.y === defaultY)) {
                        defaultY = "";
                    }

                    change(defaultY as number);
                }

                public override applyValue(value: number, delta?: {
                    changeX: number,
                    changeY: number,
                    distance: number
                }): boolean {
                    if (delta) {
                        for (let block of this.blocks) {
                            block.move(block.position.x, block.position.y + delta.changeX, false, true);
                        }
                    } else {
                        for (let block of this.blocks) {
                            block.move(block.position.x, value, false, true);
                        }
                    }

                    return true;
                }
            },
        ]);
    }

    public override isVisible(): boolean {
        return this.blocks.length === 1;
    }

}
