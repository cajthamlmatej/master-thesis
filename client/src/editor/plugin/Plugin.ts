import {load} from "@/editor/plugin/quickjs/QuickJSRunner";
import type {QuickJSContext, QuickJSHandle} from "quickjs-emscripten";
import type Material from "@/models/Material";
import {useEditorStore} from "@/stores/editor";
import {watch} from "vue";
import {ImageBlockDeserializer} from "@/editor/block/image/ImageBlockDeserializer";
import {parse} from "uuid";
import {generateUUID} from "@/utils/Generators";

export class Plugin {

    private readonly name: string;
    private readonly pluginCode: string;

    private readonly materialStore = useEditorStore();

    private context!: QuickJSContext;
    private baseEval!: QuickJSHandle;

    constructor(name: string, pluginCode: string) {
        this.name = name;
        this.pluginCode = pluginCode;

        watch(() => this.materialStore.getActiveSlide(), (value) => {
            if(!value) return;

            const slideId = this.context.newString(value.id);

            this.callFunctionIfExists("onSlideChange", slideId);
        });


        this.prepareContext();
    }

    private async prepareContext() {
        const QuickJS = await load();
        const context = QuickJS.newContext()
        this.context = context;

        this.setupContext();

        const result = context.evalCode(this.pluginCode, "plugin.js", {type: "module"});

        this.baseEval = context.unwrapResult(result);

        this.callFunctionIfExists("onLoad");
    }

    private setupContext() {
        const api = this.context.newObject();

        this.context.setProp(api, "log", this.context.newFunction("log", (args) => {
            console.log(`[Plugin: ${this.name}]`, this.context.dump(args) + ``);
            return this.context.undefined;
        }));

        const editor = this.context.newObject();

        this.context.setProp(editor, "addBlock", this.context.newFunction("addBlock", (data) => {
            const editor = this.materialStore.getEditor();

            if(!editor) return;

            const parsedData = this.context.dump(data)

            if(!parsedData.id) {
                parsedData.id = generateUUID();
            }

            const block = editor.blockRegistry.deserializeEditor(parsedData);

            if(!block) {
                console.error(`[Plugin API: ${this.name}] Could not deserialize block`);
                return
            }

            editor.addBlock(block, true);
        }));

        this.context.setProp(api, "getEditor", this.context.newFunction("getEditor", (args) => {
            console.log(`Getting editor`);
            return editor;
        }));

        this.context.setProp(this.context.global, "api", api);
    }

    private callFunctionIfExists(name: string, ...args: QuickJSHandle[]) {
        const fnc = this.context.getProp(this.baseEval, name);

        const dump = this.context.dump(fnc);

        if (!fnc || !dump) {
            return;
        }

        this.context.callFunction(fnc, this.context.undefined);
    }
}
