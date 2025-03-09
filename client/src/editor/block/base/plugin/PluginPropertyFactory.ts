import {PluginProperty} from "@/editor/block/base/plugin/PluginProperty";
import {Property} from "@/editor/property/Property";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginTextProperty} from "@/editor/block/base/plugin/property/PluginTextProperty";
import {PluginBooleanProperty} from "@/editor/block/base/plugin/property/PluginBooleanProperty";
import {PluginColorProperty} from "@/editor/block/base/plugin/property/PluginColorProperty";
import {PluginNumberProperty} from "@/editor/block/base/plugin/property/PluginNumberProperty";
import {PluginSelectProperty} from "@/editor/block/base/plugin/property/PluginSelectProperty";

export class PluginPropertyFactory {

    public createProperty(property: PluginProperty): Property<PluginEditorBlock> {
        switch (property.type) {
            case "text": {
                return new PluginTextProperty(property);
            }
            case "boolean": {
                return new PluginBooleanProperty(property);
            }
            case "color": {
                return new PluginColorProperty(property);
            }
            case "number": {
                return new PluginNumberProperty(property);
            }
            case "select": {
                return new PluginSelectProperty(property);
            }
        }
    }

}
