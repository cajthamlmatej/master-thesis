import Editor from "@/editor/Editor";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {EditorSelector} from "@/editor/selector/EditorSelector";
import {getRotatedRectanglePoints} from "@/utils/spaceManipulation";
import {generateUUID} from "@/utils/Generators";

export class EditorSelectorContext {
    public element!: HTMLElement;
    private selector: EditorSelector;
    private active: boolean = false;
    private position: { x: number, y: number } = {x: 0, y: 0};

    private actions = [
        {
            name: "group",
            label: "Group",
            icon: "mdi mdi-group",
            visible: (selected: EditorBlock[], editor: Editor) => {
                const groups = selected.reduce((acc, b) => acc.add(b.group), new Set<string | undefined>());
                return selected.every(b => b.editorSupport().group)
                    && selected.length > 1
                    && (groups.size > 1 || (groups.size == 1 && groups.has(undefined)));
            },
            action: (selected: EditorBlock[], editor: Editor) => {
                let modified = new Set<EditorBlock>();

                let groupId = generateUUID();
                let handleGroups = new Set<string>();

                for (const block of selected) {
                    if (block.group) {
                        handleGroups.add(block.group);
                    }

                    block.group = groupId;
                    modified.add(block);
                }

                for (const group of handleGroups) {
                    const groupBlocks = editor.getBlocksInGroup(group)

                    if (groupBlocks.length <= 1) {
                        for (const block of groupBlocks) {
                            block.group = undefined;
                            modified.add(block);
                        }
                    }
                }

                this.selector.getEditor().events.BLOCK_GROUP_CHANGED.emit(Array.from(modified));

                this.handleContext(this.selector.getSelectedBlocks());
            },
        },
        {
            name: "ungroup",
            label: "Ungroup",
            icon: "mdi mdi-ungroup",
            visible: (selected: EditorBlock[], editor: Editor) => {
                const groups = selected.reduce((acc, b) => acc.add(b.group), new Set<string | undefined>());
                return selected.every(b => b.editorSupport().group)
                    && selected.length > 1
                    && groups.size == 1 && !groups.has(undefined);
            },
            action: (selected: EditorBlock[], editor: Editor) => {
                for (const block of selected) {
                    block.group = undefined;
                }

                this.selector.getEditor().events.BLOCK_GROUP_CHANGED.emit(Array.from(selected));

                // TODO: handle groups that are now empty (<= 1 block)

                this.handleContext(this.selector.getSelectedBlocks());
            },
        },
        {
            name: "lock",
            label: "Lock",
            icon: "mdi mdi-lock",
            visible: (selected: EditorBlock[], editor: Editor) => {
                return selected.every(b => b.editorSupport().lock && !b.locked);
            },
            action: (selected: EditorBlock[], editor: Editor) => {
                for (const block of selected) {
                    block.lock();
                }
                this.selector.getEditor().events.BLOCK_LOCK_CHANGED.emit({
                    blocks: selected,
                    locked: true
                });
                this.handleContext(this.selector.getSelectedBlocks());
            },
        },
        {
            name: "unlock",
            label: "Unlock",
            icon: "mdi mdi-lock-open",
            visible: (selected: EditorBlock[], editor: Editor) => {
                return selected.every(b => b.editorSupport().lock) && selected.some(b => b.locked);
            },
            action: (selected: EditorBlock[], editor: Editor) => {
                for (const block of selected) {
                    block.unlock();
                }
                this.selector.getEditor().events.BLOCK_LOCK_CHANGED.emit({
                    blocks: selected,
                    locked: false
                });
                this.handleContext(this.selector.getSelectedBlocks());
            },
        },
    ]

    constructor(selector: EditorSelector) {
        this.selector = selector;

        this.setupContext();
        this.selector.events.SELECTED_BLOCK_CHANGED.on((selected) => {
            this.handleContext(selected)
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

    private handleVisibility() {
        if (!this.active) {
            this.element.classList.remove("editor-selector-context--active");
        } else {
            this.element.classList.add("editor-selector-context--active");
        }
    }


}
