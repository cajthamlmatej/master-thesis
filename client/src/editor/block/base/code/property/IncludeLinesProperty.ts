import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginProperty} from "@/editor/block/base/plugin/PluginProperty";
import {BooleanProperty} from "@/editor/property/type/BooleanProperty";
import {CodeEditorBlock} from "@/editor/block/base/code/CodeEditorBlock";
import {TextEditorBlock} from "@/editor/block/base/text/TextEditorBlock";

export class IncludeLinesProperty<T extends CodeEditorBlock = CodeEditorBlock> extends BooleanProperty<T> {

    constructor() {
        super("Include lines", "include-lines");
    }

    getID(): string {
        return super.getID();
    }

    override getPriority(): number {
        return 1;
    }

    applyValue(value: boolean): boolean {
        this.blocks[0].setLines(value);
        return true;
    }

    isVisible(): boolean {
        return this.blocks.length === 1;
    }

    recalculateValues(change: (value: boolean) => void): void {
        change(this.blocks[0].getLines());
    }
}
