import {TextProperty} from "@/editor/property/type/TextProperty";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginProperty} from "@/editor/block/base/plugin/PluginProperty";
import {BooleanProperty} from "@/editor/property/type/BooleanProperty";
import {NumberProperty} from "@/editor/property/type/NumberProperty";

export class PluginNumberProperty extends NumberProperty<PluginEditorBlock> {
    private property: PluginProperty;
    constructor(property: PluginProperty) {
        super(property.label.substring(0, 25), property.key);
        this.property = property;
    }

    override getPriority(): number {
        return 2000;
    }

    applyValue(value: number): boolean {
        this.blocks[0].setDataField(this.property.key, value);
        return true;
    }

    isVisible(): boolean {
        return this.blocks.length === 1;
    }

    recalculateValues(change: (value: number) => void): void {
        change(this.blocks[0].getDataField(this.property.key));
    }
}
