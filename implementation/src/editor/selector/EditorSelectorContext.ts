import Editor from "@/editor/Editor";
import type {Block} from "@/editor/block/Block";
import type {EditorSelector} from "@/editor/selector/EditorSelector";
import {getRotatedRectanglePoints} from "@/utils/spaceManipulation";

export class EditorSelectorContext {
    private selector: EditorSelector;
    public element!: HTMLElement;

    private active: boolean = false;
    private position: { x: number, y: number } = {x: 0, y: 0};

    private actions = [
        {
            name: "lock",
            label: "Lock",
            icon: "mdi mdi-lock",
            visible: (selected: Block[], editor: Editor) => {
                return selected.every(b => b.editorSupport().lock && !b.locked);
            },
            action: (selected: Block[], editor: Editor) => {
                for (const block of selected) {
                    block.lock();
                }
                this.selector.handleSelector();
                this.handleContext(this.selector.getSelectedBlocks());
            },
        },
        {
            name: "unlock",
            label: "Unlock",
            icon: "mdi mdi-lock-open",
            visible: (selected: Block[], editor: Editor) => {
                return selected.every(b => b.editorSupport().lock) && selected.some(b => b.locked);
            },
            action: (selected: Block[], editor: Editor) => {
                for (const block of selected) {
                    block.unlock();
                }
                this.selector.handleSelector();
                this.handleContext(this.selector.getSelectedBlocks());
            },
        },
    ]

    constructor(selector: EditorSelector) {
        this.selector = selector;

        this.setupContext();
        this.selector.EVENT_SELECTION_CHANGED.on((selected) => {
            this.handleContext(selected)
        });
        this.selector.EVENT_SELECTION_AREA_CHANGED.on((data) => {
            this.recalculatePosition(data);
        });
    }

    private getActions() {
        return this.actions;
    }

    private setupContext() {
        const contextElement = document.createElement("div");

        contextElement.classList.add("editor-selector-context");

        for (const action of this.getActions()) {
            const actionElement = document.createElement("div");
            actionElement.classList.add("action");
            actionElement.setAttribute("data-action", action.name);
            actionElement.innerHTML = `<i class="${action.icon}"></i>`;

            actionElement.addEventListener("mousedown", (e) => {
                console.debug("Action", action.name, "executed for", this.selector.getSelectedBlocks().length, "blocks");
                action.action(this.selector.getSelectedBlocks(), this.selector.getEditor());

                e.preventDefault();
                e.stopImmediatePropagation();
            });

            contextElement.appendChild(actionElement);
        }

        this.selector.getEditor().getEditorElement().appendChild(contextElement);

        this.element = contextElement;
    }


    public handleContext(selected: Block[]) {
        if(!selected || selected.length == 0) {
            this.active = false;
            this.handleVisibility();
            return;
        } else {
            this.active = true;
        }

        for (const action of this.getActions()) {
            const visible = action.visible(this.selector.getSelectedBlocks(), this.selector.getEditor());
            console.log("Action", action.name, "visible:", visible);
            const actionElement = this.element.querySelector(`.action[data-action="${action.name}"]`);

            if (actionElement) {
                if (visible) {
                    actionElement.classList.add("action--visible");
                } else {
                    actionElement.classList.remove("action--visible");
                }
            }
        }
    }

    private handleVisibility() {
        if (!this.active) {
            this.element.classList.remove("editor-selector-context--active");
        } else {
            this.element.classList.add("editor-selector-context--active");
        }
    }

    public recalculatePosition(data: { x: number; y: number; width: number; height: number; rotation: number }) {
        const rotatedPoints = getRotatedRectanglePoints(data.x, data.y, data.width, data.height, data.rotation);

        const top = Math.min(...rotatedPoints.map(p => p.y));
        const left = Math.min(...rotatedPoints.map(p => p.x));
        const right = Math.max(...rotatedPoints.map(p => p.x));

        this.position = {
            x: (left + right) / 2,
            y: top,
        };
        this.position = this.selector.getEditor().capPositionToEditorBounds(this.position.x, this.position.y);

        this.handleVisibility();
        this.element.style.setProperty("--x", this.position.x + "px");
        this.element.style.setProperty("--y", this.position.y + "px");
    }


}
