import {PluginContext} from '../PluginContext';
import Editor from "@/editor/Editor";
import {load} from "@/editor/plugin/quickjs/QuickJSRunner";
import {QuickJSContext, QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApi} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorPluginEvent} from "@/editor/plugin/editor/EditorPluginEvent";
import {usePluginStore} from "@/stores/plugin";
import {PluginManager} from "@/editor/plugin/PluginManager";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";

export class EditorPlugin {
    private plugin: PluginContext;
    private code: string;

    private editor: Editor | undefined;
    private context: QuickJSContext | undefined;

    private baseEvaluation: QuickJSHandle;

    private loadedResolve: (value: void) => void;
    public loadedPromise = new Promise<void>((resolve) => {
        this.loadedResolve = resolve;
    });

    private callbacks: Record<EditorPluginEvent, QuickJSHandle | undefined> = {
        panelMessage: undefined, panelRegister: undefined,
        pluginBlockRender: undefined, pluginBlockMessage: undefined, pluginBlockPropertyChange: undefined,
        createCustomBlock: undefined
    };
    private api: EditorPluginApi = new EditorPluginApi();
    private pluginMessageCallback: ((message: string) => void) | undefined;

    constructor(plugin: PluginContext, code: string, editor?: Editor) {
        this.plugin = plugin;
        this.code = code;

        if (editor) this.editor = editor;

        this.prepareContext();
    }

    public registerCallback(name: EditorPluginEvent, fnc: QuickJSHandle) {
        if (!this.context) throw new Error("Context not ready");

        try {
            const evalFnc = this.context.evalCode(`(${fnc})`, "event.js");
            const result = this.context.unwrapResult(evalFnc);

            if (!result) {
                this.plugin.log(`Error while registering function ${name}: ${evalFnc}`);
                return;
            }

            this.callbacks[name] = result;
        } catch (e) {
            this.plugin.log(`Error while registering function ${name}: ${e}`);
        }
    }

    public async callEvent(name: EditorPluginEvent, ...args: QuickJSHandle[]) {
        if (!this.context) throw new Error("Context not ready");
        await this.loadedPromise;

        const fnc = this.callbacks[name];

        if (!fnc) {
            return;
        }

        return this.context.callFunction(fnc, this.context.undefined, ...args);
    }

    public serializeAny(value: any): QuickJSHandle {
        if (!this.context) throw new Error("Context not ready");

        if (value === null || value === undefined) return this.context!.undefined;

        if (typeof value === "string") {
            return this.context!.newString(value);
        } else if (typeof value === "number") {
            return this.context!.newNumber(value);
        } else if (typeof value === "boolean") {
            return value ? this.context!.true : this.context!.false;
        } else if (typeof value === "object") {
            const obj = this.context!.newObject();
            for (const key in value) {
                this.context!.setProp(obj, key, this.serializeAny(value[key]));
            }
            return obj;
        } else {
            throw new Error(`Unsupported type for serialization: ${typeof value}`);
        }
    }

    public serializeBlock(block: EditorBlock): QuickJSHandle {
        const base = this.serializeAny(block.serialize());

        const data = {
            context: this.context!,
            editorPlugin: this,
            editor: this.editor!,
            plugin: this.plugin,
            pluginManager: usePluginStore().manager as PluginManager
        };

        const blockApiFeatures = block.getApiFeatures();

        for (const feature of blockApiFeatures) {
            const newFeature = new feature.apiFeature();
            newFeature.register(base, data, block);
            // this.plugin.log(`Registered block api feature ${feature.apiFeature.name}`);
        }

        return base;
    }

    public async getPanel() {
        await this.loadedPromise;
        const result = await this.callEvent(EditorPluginEvent.PANEL_REGISTER);

        if (!result) return;

        return this.context!.dump(result.unwrap());
    }

    public setPanelMessageCallback(fnc: (message: string) => void) {
        this.pluginMessageCallback = fnc;
    }

    public async processMessageFromPanel(message: string) {
        const args = this.context!.newString(message);
        const result = await this.callEvent(EditorPluginEvent.PANEL_MESSAGE, args);

        if (!result) return;

        return this.context!.dump(result.unwrap());
    }

    public async renderBlock(block: EditorBlock) {
        await this.loadedPromise;
        const serializedBlock = this.serializeBlock(block);

        const result = await this.callEvent(EditorPluginEvent.PLUGIN_BLOCK_RENDER, serializedBlock);

        if (!result) {
            console.error("Error while rendering block");
            return "";
        }

        return this.context!.dump(result.unwrap());
    }

    public sendMessageToPanel(message: string) {
        if (this.pluginMessageCallback) {
            this.pluginMessageCallback(message);
        }
    }

    async processBlockMessage(block: PluginEditorBlock, message: string) {
        await this.loadedPromise;
        const serializedBlock = this.serializeBlock(block);

        const result = await this.callEvent(EditorPluginEvent.PLUGIN_BLOCK_MESSAGE, serializedBlock, this.context!.newString(message));

        if (!result) return "";

        return this.context!.dump(result.unwrap());
    }

    async processBlockPropertyChange(param: PluginEditorBlock, key: string) {
        const serializedBlock = this.serializeBlock(param);

        await this.callEvent(EditorPluginEvent.PLUGIN_BLOCK_PROPERTY_CHANGE, serializedBlock, this.context!.newString(key));
    }


    async createCustomBlock(id: string): Promise<string> {
        const result = await this.callEvent(EditorPluginEvent.CREATE_CUSTOM_BLOCK, this.context!.newString(id));

        if (!result) return "";

        return this.context!.dump(result.unwrap());
    }

    public serializeObject(value: any, object?: QuickJSHandle): QuickJSHandle {
        if (!this.context) throw new Error("Context not ready");

        if (!object) {
            object = this.context.newObject();
        }

        for (const key in value) {
            this.context.setProp(object, key, this.serializeAny(value[key]));
        }

        return object;
    }

    private async prepareContext() {
        const QuickJS = await load();
        this.context = QuickJS.newContext();

        const result = this.context.evalCode(this.code, "editor.js", {type: "module"});

        this.baseEvaluation = this.context.unwrapResult(result);

        this.setupContext();
        if (!(await this.callFunctionIfExists("initEditor"))) {
            console.error("Error while calling initEditor");
            return;
        }

        this.loadedResolve();
        this.editor?.redrawBlocks();
    }

    private setupContext() {
        if (!this.context || !this.editor) {
            console.error("Context or editor not ready, cannot setup context");
            return;
        }

        this.api.register({
            context: this.context,
            editor: this.editor,
            editorPlugin: this,
            plugin: this.plugin,
            pluginManager: usePluginStore().manager as PluginManager
        });

        this.plugin.log(`Prepared context`);
    }

    private async callFunctionIfExists(name: string, ...args: QuickJSHandle[]) {
        if (!this.context) throw new Error("Context not ready");

        const fnc = this.context.getProp(this.baseEvaluation, name);

        if (!fnc) {
            return false;
        }

        const dump = this.context.dump(fnc);

        if (!dump) {
            return false;
        }

        try {
            return this.context.callFunction(fnc, this.context.undefined, ...args);
        } catch (e) {
            this.plugin.log(`Error while calling function ${name}: ${e}`);
            return false;
        }

        return true;
    }
}
