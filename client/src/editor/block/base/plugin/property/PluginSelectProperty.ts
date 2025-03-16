import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginPropertyBase, SelectPluginProperty} from "@/editor/block/base/plugin/PluginProperty";
import {SelectProperty} from "@/editor/property/type/SelectProperty";

export class PluginSelectProperty extends SelectProperty<PluginEditorBlock> {
    private property: SelectPluginProperty & PluginPropertyBase;

    constructor(property: SelectPluginProperty & PluginPropertyBase) {
        super(property.label, property.key, property.options);
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
