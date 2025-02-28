import {TextProperty} from "@/editor/property/type/TextProperty";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginProperty, PluginPropertyBase, SelectPluginProperty} from "@/editor/block/base/plugin/PluginProperty";
import {BooleanProperty} from "@/editor/property/type/BooleanProperty";
import {SelectProperty} from "@/editor/property/type/SelectProperty";

export class PluginSelectProperty extends SelectProperty<PluginEditorBlock> {
    private property: SelectPluginProperty & PluginPropertyBase;
    constructor(property: SelectPluginProperty & PluginPropertyBase) {
        super(property.label.substring(0, 25), property.key, property.options);
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
