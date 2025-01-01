import Editor from "@/editor/Editor";
import type {ContextAction} from "@/editor/actions/ContextAction";
import {CopyAction} from "@/editor/actions/context/CopyAction";
import {DeleteAction} from "@/editor/actions/context/DeleteAction";
import {DuplicateAction} from "@/editor/actions/context/DuplicateAction";
import {PasteAction} from "@/editor/actions/context/PasteAction";
import {ZIndexUpAction} from "@/editor/actions/context/ZIndexUpAction";
import {ZIndexTopAction} from "@/editor/actions/context/ZIndexTopAction";
import {ZIndexBottomAction} from "@/editor/actions/context/ZIndexBottomAction";
import {ZIndexDownAction} from "@/editor/actions/context/ZIndexDownAction";

export class EditorContext {
    public element!: HTMLElement;
    public position: { x: number, y: number } = {x: 0, y: 0};
    private editor: Editor;
    private active: boolean = false;
    private actions: ContextAction[] = [];

    constructor(editor: Editor) {
        this.editor = editor;
        this.actions.push(new CopyAction());
        this.actions.push(new DeleteAction());
        this.actions.push(new DuplicateAction());
        this.actions.push(new PasteAction());
        this.actions.push(new ZIndexUpAction());
        this.actions.push(new ZIndexDownAction());
        this.actions.push(new ZIndexTopAction());
        this.actions.push(new ZIndexBottomAction());

        this.setupContext();
    }

    public handleContext() {
        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";

        let visibleActions = 0;

        for (const action of this.getActions()) {
            const visible = action.isVisible({
                selected: this.editor.getSelector().getSelectedBlocks(),
                editor: this.editor,
                position: this.position
            });
            const actionElement = this.element.querySelector(`.action[data-action="${action.name}"]`);

            if (actionElement) {
                if (visible) {
                    actionElement.classList.add("action--visible");
                } else {
                    actionElement.classList.remove("action--visible");
                }
            }

            if (visible) {
                visibleActions++;
            }
        }

        if (visibleActions === 0) {
            this.active = false;
            this.handleVisibility();
        }
    }

    private getActions() {
        return this.actions;
    }

    private setupContext() {
        const contextElement = document.createElement("div");

        contextElement.classList.add("editor-context");

        for (const action of this.getActions()) {
            const actionElement = document.createElement("div");
            actionElement.classList.add("action");
            actionElement.setAttribute("data-action", action.name);
            actionElement.innerText = action.label;

            actionElement.addEventListener("mousedown", (e) => {
                console.debug("Action", action.name, "executed for", this.editor.getSelector().getSelectedBlocks().length, "blocks");
                action.run({
                    selected: this.editor.getSelector().getSelectedBlocks(),
                    editor: this.editor,
                    position: this.position
                });

                this.active = false;

                this.handleVisibility();

                e.preventDefault();
                e.stopImmediatePropagation();
            });

            contextElement.appendChild(actionElement);
        }

        this.editor.getEditorElement().appendChild(contextElement);

        this.element = contextElement;

        this.setupEvents();
    }

    private setupEvents() {
        // Selecting blocks
        window.addEventListener("contextmenu", (event) => {
            // If the element is not in the editor, do not do anything
            if (!this.editor.getEditorElement().contains(event.target as Node)) {
                return;
            }

            // Disable classic context menu
            event.preventDefault();

            // note(Matej): Not needed probably? We dont need to check what he clicked on
            // const blockElement = (event.target as HTMLElement).closest(".block");
            //
            // // Is a block?
            // if (blockElement) {
            //     const block = this.editor.getBlockById(blockElement.getAttribute("data-block-id")!);
            //
            //     if (!block) {
            //         console.error("[EditorSelector] Clicked block not found (by id).");
            //         return;
            //     }
            //
            //     if (this.editor.getSelector().isSelected(block)) {
            //         this.position = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);
            //         this.active = true;
            //         this.handleContext();
            //         this.handleVisibility();
            //     }
            //     return;
            // }

            // Probably clicked inside the editor and not in a block, try to show it, if actions are available
            this.position = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

            this.active = true;
            this.handleContext();
            this.handleVisibility();
        });

        window.addEventListener("click", (event) => {
            if (event.button !== 0) return;

            this.active = false;
            this.handleVisibility();
        });
    }

    private handleVisibility() {
        if (!this.active) {
            this.element.classList.remove("editor-context--active");
        } else {
            this.element.classList.add("editor-context--active");
        }
    }


}
