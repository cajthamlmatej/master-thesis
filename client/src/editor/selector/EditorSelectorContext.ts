import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {EditorSelector} from "@/editor/selector/EditorSelector";
import {getRotatedRectanglePoints} from "@/utils/spaceManipulation";
import {SelectorAction} from "@/editor/actions/SelectorAction";
import {GroupAction} from "@/editor/actions/selector/GroupAction";
import {UngroupAction} from "@/editor/actions/selector/UngroupAction";
import {LockAction} from "@/editor/actions/selector/LockAction";
import {UnlockAction} from "@/editor/actions/selector/UnlockAction";
import {BringBackAction} from "@/editor/actions/selector/BringBackAction";

export class EditorSelectorContext {
    private static SIZE = 40;

    public element!: HTMLElement;
    private selector: EditorSelector;
    private active: boolean = false;
    private position: { x: number, y: number } = {x: 0, y: 0};

    private actions: SelectorAction[] = [];

    constructor(selector: EditorSelector) {
        this.selector = selector;
        this.actions.push(new GroupAction());
        this.actions.push(new UngroupAction());
        this.actions.push(new LockAction());
        this.actions.push(new UnlockAction());
        this.actions.push(new BringBackAction());

        // this.actions.push(new TextBoldAction());
        // this.actions.push(new TextItalicsAction());
        // this.actions.push(new TextUnderlineAction());
        // this.actions.push(new TextStrikethroughAction());
        // this.actions.push(new TextSuperscriptAction());
        // this.actions.push(new TextSubscriptAction());
        // this.actions.push(new TextBulletedListAction());
        // this.actions.push(new TextOrderedListAction());

        this.setupContext();
        this.selector.events.SELECTED_BLOCK_CHANGED.on((selected) => {
            this.handleContext(selected)
        });
        this.selector.getEditor().events.BLOCK_POSITION_CHANGED.on((data) => {
            this.handleContext(this.selector.getSelectedBlocks());
        });
        this.selector.events.AREA_CHANGED.on((data) => {
            this.recalculatePosition(data);
        });
    }

    public handleContext(selected: EditorBlock[]) {
        if (!selected || selected.length == 0) {
            this.active = false;
            this.handleVisibility();
            return;
        } else {
            this.active = true;
        }

        for (const action of this.getActions()) {
            const visible = action.isVisible({
                editor: this.selector.getEditor(),
                selected: selected,
                position: {x: this.position.x, y: this.position.y}
            });
            const actionElement = this.element.querySelector(`.action[data-action="${action.name}"]`);

            if (actionElement) {
                if (visible) {
                    actionElement.classList.add("action--visible");
                } else {
                    actionElement.classList.remove("action--visible");
                }
            }
        }

        this.recalculatePosition(this.selector.getArea().getArea());
    }

    public recalculatePosition(data: { x: number; y: number; width: number; height: number; rotation: number }) {
        const rotatedPoints = getRotatedRectanglePoints(data.x, data.y, data.width, data.height, data.rotation);

        const top = Math.min(...rotatedPoints.map(p => p.y));
        const left = Math.min(...rotatedPoints.map(p => p.x));
        const right = Math.max(...rotatedPoints.map(p => p.x));

        const activeActions = this.element.querySelectorAll(".action--visible").length;
        const width = (EditorSelectorContext.SIZE * activeActions + (EditorSelectorContext.SIZE / 4 * (activeActions - 1)));
        this.position = {
            x: (left + right) / 2 - width / 2,
            y: top - EditorSelectorContext.SIZE * 1.5
        };

        this.position = this.selector.getEditor()
            .capPositionToEditorBounds(this.position.x, this.position.y,
                width, EditorSelectorContext.SIZE);

        this.handleVisibility();
        this.element.style.setProperty("--x", this.position.x + "px");
        this.element.style.setProperty("--y", this.position.y + "px");
    }

    public isActive() {
        return this.active;
    }

    public getActions() {
        return this.actions;
    }

    private setupContext() {
        const contextElement = document.createElement("div");

        contextElement.classList.add("editor-selector-context");
        contextElement.style.setProperty("--action-size", EditorSelectorContext.SIZE + "px");

        for (const action of this.getActions()) {
            const actionElement = document.createElement("div");
            actionElement.classList.add("action");
            actionElement.setAttribute("data-action", action.name);
            actionElement.innerHTML = `<i class="${action.icon}"></i>`;

            actionElement.addEventListener("mousedown", (e) => {
                console.debug("Action", action.name, "executed for", this.selector.getSelectedBlocks().length, "blocks");
                action.run({
                    editor: this.selector.getEditor(),
                    selected: this.selector.getSelectedBlocks(),
                    position: {x: this.position.x, y: this.position.y}
                });
                this.handleContext(this.selector.getSelectedBlocks());

                e.preventDefault();
                e.stopImmediatePropagation();
            });

            contextElement.appendChild(actionElement);
        }

        this.selector.getEditor().getEditorElement().appendChild(contextElement);

        this.element = contextElement;
    }

    private handleVisibility() {
        if (!this.active) {
            this.element.classList.remove("editor-selector-context--active");
        } else {
            this.element.classList.add("editor-selector-context--active");
        }
    }


}
