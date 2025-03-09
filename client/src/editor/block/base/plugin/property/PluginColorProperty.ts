import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginProperty} from "@/editor/block/base/plugin/PluginProperty";
import {ColorProperty} from "@/editor/property/type/ColorProperty";

export class PluginColorProperty extends ColorProperty<PluginEditorBlock> {
    private property: PluginProperty;

    constructor(property: PluginProperty) {
        super(property.label.substring(0, 25), property.key);
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
