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
import {MoveAction} from "@/editor/actions/context/MoveAction";
import {SelectAllAction} from "@/editor/actions/context/SelectAllAction";
import {UndoAction} from "@/editor/actions/context/UndoAction";
import {RedoAction} from "@/editor/actions/context/RedoAction";
import {$t} from "@/translation/Translation";
import {ModeAction} from "@/editor/actions/context/ModeAction";
import {FitCanvasToParentAction} from "@/editor/actions/context/FitCanvasToParentAction";

/**
 * Manages the context menu for the editor, including its actions and visibility.
 */
export class EditorContext {
    public element!: HTMLElement;
    public position: { x: number, y: number } = {x: 0, y: 0};
    private editor: Editor;
    private active: boolean = false;
    private actions: ContextAction[] = [];

    /**
     * Initializes the EditorContext with the given editor instance.
     * @param editor The editor instance to associate with this context.
     */
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

        this.actions.push(new MoveAction());

        this.actions.push(new SelectAllAction());
        this.actions.push(new ModeAction());
        this.actions.push(new UndoAction());
        this.actions.push(new RedoAction());
        this.actions.push(new FitCanvasToParentAction());

        this.setupContext();
    }

    /**
     * Updates the context menu's position and visibility based on the current state.
     */
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

    /**
     * Checks if the context menu is currently active.
     * @returns True if the context menu is active, false otherwise.
     */
    public isActive() {
        return this.active;
    }

    /**
     * Retrieves the list of actions available in the context menu.
     * @returns An array of context actions.
     */
    public getActions() {
        return this.actions;
    }

    /**
     * Sets up the context menu's DOM structure and event listeners.
     */
    private setupContext() {
        const contextElement = document.createElement("div");

        contextElement.classList.add("editor-context");

        for (const action of this.getActions()) {
            const actionElement = document.createElement("div");
            actionElement.classList.add("action");
            actionElement.setAttribute("data-action", action.name);
            actionElement.innerText = $t('editor.action.' + action.name + '.label');

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

    /**
     * Sets up global event listeners for context menu interactions.
     */
    private setupEvents() {
        // Selecting blocks
        const contextMenuEvent = this.handleContextMenuEvent.bind(this);
        const clickEvent = this.handleClickEvent.bind(this);

        window.addEventListener("contextmenu", contextMenuEvent);
        window.addEventListener("click", clickEvent);

        this.editor.events.EDITOR_DESTROYED.on(() => {
            window.removeEventListener("contextmenu", contextMenuEvent);
            window.removeEventListener("click", clickEvent);
        })
    }

    /**
     * Handles click events to deactivate the context menu.
     * @param event The mouse event triggered by a click.
     */
    private handleClickEvent(event: MouseEvent) {
        if (event.button !== 0) return;

        this.active = false;
        this.handleVisibility();
    }

    /**
     * Handles right-click (context menu) events to activate the context menu.
     * @param event The mouse event triggered by a right-click.
     */
    private handleContextMenuEvent(event: MouseEvent) {
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
    }

    /**
     * Updates the visibility of the context menu based on its active state.
     */
    private handleVisibility() {
        if (!this.active) {
            this.element.classList.remove("editor-context--active");
        } else {
            this.element.classList.add("editor-context--active");
        }
    }
}
