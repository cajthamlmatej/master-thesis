import {TextProperty} from "@/editor/property/type/TextProperty";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginProperty} from "@/editor/block/base/plugin/PluginProperty";

export class PluginTextProperty extends TextProperty<PluginEditorBlock> {
    private property: PluginProperty;

    constructor(property: PluginProperty) {
        super(property.label, property.key);
        this.property = property;
    }

    override getPriority(): number {
        return 2000;
    }

    applyValue(value: string): boolean {
        this.blocks[0].setDataField(this.property.key, value);
        return true;
    }

    isVisible(): boolean {
        return this.blocks.length === 1;
    }

    recalculateValues(change: (value: string) => void): void {
        change(this.blocks[0].getDataField(this.property.key));
    }
}
