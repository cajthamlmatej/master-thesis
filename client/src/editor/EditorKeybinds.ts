import type {ActionKeybind} from "@/editor/actions/EditorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";
import type Editor from "@/editor/Editor";
import {EditorAction} from "@/editor/actions/EditorAction";

interface KeybindMapping {
    keybind: ActionKeybind;
    action: EditorAction;
    isVisible: () => boolean;
}

export default class EditorKeybinds {
    private readonly editor: Editor;
    private keybinds: KeybindMapping[] = [];

    private mouse: { x: number, y: number } = {x: 0, y: 0};

    constructor(editor: Editor) {
        this.editor = editor;

        window.addEventListener("keydown", this.process.bind(this));
        window.addEventListener("mousemove", this.trackMouse.bind(this));

        this.initializeKeybinds();

        editor.events.EDITOR_DESTROYED.on(() => {
            window.removeEventListener("keydown", this.process.bind(this));
            window.removeEventListener("mousemove", this.trackMouse.bind(this));
        });
    }

    private process(event: KeyboardEvent) {
        const positionInEditor = this.editor.screenToEditorCoordinates(this.mouse.x, this.mouse.y);

        for(let keybind of this.keybinds) {
            if (keybind.keybind.key === event.key) {
                let process = true;

                if(keybind.keybind.ctrlKey === 'ALWAYS' && !event.ctrlKey) process = false;
                if(keybind.keybind.ctrlKey === 'NEVER' && event.ctrlKey) process = false;

                if(keybind.keybind.shiftKey === 'ALWAYS' && !event.shiftKey) process = false;
                if(keybind.keybind.shiftKey === 'NEVER' && event.shiftKey) process = false;

                if(keybind.keybind.altKey === 'ALWAYS' && !event.altKey) process = false;
                if(keybind.keybind.altKey === 'NEVER' && event.altKey) process = false;

                if(!process) continue;

                switch(keybind.keybind.mode) {
                    case 'ALWAYS':
                        break;
                    case 'COULD_BE_VISIBLE':
                        process = keybind.action.isVisible({
                            editor: this.editor,
                            position: positionInEditor,
                            selected: this.editor.getSelector().getSelectedBlocks()
                        });
                        break;
                    case 'WHEN_VISIBLE':
                        process = keybind.action.isVisible({
                            editor: this.editor,
                            position: positionInEditor,
                            selected: this.editor.getSelector().getSelectedBlocks()
                        });

                        process &&= keybind.isVisible();
                        break;
                }

                if(!process) continue;

                event.preventDefault();
                keybind.action.run({
                    editor: this.editor,
                    position: positionInEditor,
                    selected: this.editor.getSelector().getSelectedBlocks(),
                    keybind: {
                        key: event.key,
                        ctrlKey: event.ctrlKey,
                        shiftKey: event.shiftKey,
                        altKey: event.altKey
                    }
                });
                return;
            }
        }
    }

    private trackMouse(event: MouseEvent) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }

    /**
     * This method initializes the keybinds for the editor.
     * This method can be called multiple times to reinitialize the keybinds (for example when actions are added or removed).
     */
    public initializeKeybinds() {
        for(let action of this.editor.getContext().getActions()) {
            for(let keybind of action.getKeybinds()) {
                this.keybinds.push({
                    keybind: keybind,
                    action: action,
                    isVisible: () => this.editor.getContext().isActive()
                })
            }
        }

        for(let action of this.editor.getSelector().getContext().getActions()) {
            for(let keybind of action.getKeybinds()) {
                this.keybinds.push({
                    keybind: keybind,
                    action: action,
                    isVisible: () => this.editor.getSelector().getContext().isActive()
                })
            }
        }
    }

    public getKeybinds(): KeybindMapping[] {
        return this.keybinds;
    }

}
