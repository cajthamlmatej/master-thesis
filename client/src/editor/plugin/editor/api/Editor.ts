import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {AddBlockApiFeature} from "@/editor/plugin/editor/api/editor/AddBlock";
import {RemoveBlockApiFeature} from "@/editor/plugin/editor/api/editor/RemoveBlock";
import {GetBlocksApiFeature} from "@/editor/plugin/editor/api/editor/GetBlocks";
import {GetSizeApiFeature} from "@/editor/plugin/editor/api/editor/GetSize";
import {SetSizeApiFeature} from "@/editor/plugin/editor/api/editor/SetSize";
import {GetModeApiFeature} from "@/editor/plugin/editor/api/editor/GetMode";
import {SetModeApiFeature} from "@/editor/plugin/editor/api/editor/SetMode";
import {SelectBlockApiFeature} from "@/editor/plugin/editor/api/editor/SelectBlock";
import {DeselectBlockApiFeature} from "@/editor/plugin/editor/api/editor/DeselectBlock";
import {IsBlockSelectedApiFeature} from "@/editor/plugin/editor/api/editor/IsBlockSelected";
import {EventsApiFeature} from "@/editor/plugin/editor/api/editor/Events";
import {PanelMessageApiFeature} from "@/editor/plugin/editor/api/editor/PanelMessage";

export class EditorApiFeature extends EditorPluginApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;

        const editorObj = context.newObject();

        (new AddBlockApiFeature()).register(editorObj, data);
        (new RemoveBlockApiFeature()).register(editorObj, data);
        (new GetBlocksApiFeature()).register(editorObj, data);

        (new GetSizeApiFeature()).register(editorObj, data);
        (new SetSizeApiFeature()).register(editorObj, data);

        (new GetModeApiFeature()).register(editorObj, data);
        (new SetModeApiFeature()).register(editorObj, data);

        (new SelectBlockApiFeature()).register(editorObj, data);
        (new DeselectBlockApiFeature()).register(editorObj, data);
        (new IsBlockSelectedApiFeature()).register(editorObj, data);

        (new EventsApiFeature()).register(editorObj, data);

        (new PanelMessageApiFeature()).register(editorObj, data);

        context.setProp(obj, "editor", editorObj);
    }

}
