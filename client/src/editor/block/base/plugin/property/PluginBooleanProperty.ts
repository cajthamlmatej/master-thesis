import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginProperty} from "@/editor/block/base/plugin/PluginProperty";
import {BooleanProperty} from "@/editor/property/type/BooleanProperty";

export class PluginBooleanProperty extends BooleanProperty<PluginEditorBlock> {
    private property: PluginProperty;

    constructor(property: PluginProperty) {
        super(property.label, property.key);
        this.property = property;
    }

    getID(): string {
        return super.getID() + this.property.key;
    }

    override getPriority(): number {
        return 2000;
    }

    applyValue(value: boolean): boolean {
        this.blocks[0].setDataField(this.property.key, value);
        return true;
    }

    isVisible(): boolean {
        return this.blocks.length === 1;
    }

    recalculateValues(change: (value: boolean) => void): void {
        change(this.blocks[0].getDataField(this.property.key));
    }
}
