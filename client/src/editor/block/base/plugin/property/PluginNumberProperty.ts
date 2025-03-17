import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginProperty} from "@/editor/block/base/plugin/PluginProperty";
import {NumberProperty} from "@/editor/property/type/NumberProperty";

export class PluginNumberProperty extends NumberProperty<PluginEditorBlock> {
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
