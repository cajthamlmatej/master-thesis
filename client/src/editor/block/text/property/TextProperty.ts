import {Property} from "@/editor/property/Property";
import {TextProperty as BaseTextProperty} from "@/editor/property/type/TextProperty";

import {ShapeEditorBlock} from "@/editor/block/shape/ShapeEditorBlock";
import type {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";

export class TextProperty<T extends TextEditorBlock = TextEditorBlock> extends BaseTextProperty<T> {

    constructor() {
        super("Text", "text");
    }

    public override isVisible(): boolean {
        return this.blocks.every(block => block.type === "text");
    }

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    public override setup(): void {
        super.setup();

        this.editorProperty.getEditor().events.BLOCK_CONTENT_CHANGED.on((block) => {
            this.processRecalculateValues();
        });
    }

    applyValue(value: string): boolean {
        for (let block of this.blocks) {
            block.changeContent(value);
        }

        return true;
    }

    recalculateValues(change: (value: string) => void): void {
        let content: string | number = this.blocks[0].content;

        if (!this.blocks.every(block => block.content === content)) {
            content = "";
        }

        change(content);
    }
}
