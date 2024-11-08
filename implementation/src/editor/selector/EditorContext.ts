import Editor from "@/editor/Editor";
import type {Block} from "@/editor/block/Block";
import {generateUUID} from "@/utils/uuid";

export class EditorContext {
    private editor: Editor;
    public element!: HTMLElement;

    private active: boolean = false;
    private position: { x: number, y: number } = {x: 0, y: 0};

    private actions = [
        // {
        //     name: "group",
        //     label: "Group",
        //     visible: (selected: Block[], editor: Editor) => {
        //         return selected.every(b => b.editorSupport().group) && selected.length >= 1;
        //     },
        //     action: (selected: Block[], editor: Editor) => {
        //         let groupId = generateUUID();
        //
        //         for (let block of selected) {
        //             block.group = groupId;
        //         }
        //         // TODO: Remove old groups, if they are <=1 blocks
        //     },
        // },
        {
            name: "copy",
            label: "Copy",
            visible: (selected: Block[], editor: Editor) => {
                return selected.every(b => b.editorSupport().selection) && selected.length >= 1;
            },
            action: (selected: Block[], editor: Editor) => {
                editor.getClipboard().markForCopy(selected);
            },
        },
        {
            name: "paste",
            label: "Paste",
            visible: (selected: Block[], editor: Editor) => {
                return editor.getClipboard().hasContent();
            },
            action: (selected: Block[], editor: Editor) => {
                editor.getClipboard().paste(this.position);
            }
        },
        {
            name: "duplicate",
            label: "Duplicate",
            visible: (selected: Block[], editor: Editor) => {
                return selected.every(b => b.editorSupport().selection) && selected.length >= 1;
            },
            action: (selected: Block[], editor: Editor) => {
                let newBlocks: Block[] = [];
                for(let block of selected) {
                    const clone = block.clone();

                    editor.addBlock(clone);

                    clone.move(clone.position.x + 20, clone.position.y + 20);

                    newBlocks.push(clone);
                }

                // Cannot be done in the loop above, because we need cant modify the selection while iterating over it
                editor.getSelector().clearSelection();
                for(let block of newBlocks) {
                    editor.getSelector().selectBlock(block, true);
                }
            }
        },
        {
            name: "delete",
            label: "Delete",
            visible: (selected: Block[], editor: Editor) => {
                return selected.every(b => b.editorSupport().selection && !b.locked) && selected.length >= 1
            },
            action: (selected: Block[], editor: Editor) => {
                selected.forEach(b => editor.removeBlock(b));
            }
        },
        {
            name: "zIndexUp",
            label: "Push forward",
            visible: (selected: Block[], editor: Editor) => {
                return selected.every(b => b.editorSupport().zIndex && !b.locked) && selected.length >= 1;
            },
            action: (selected: Block[], editor: Editor) => {
                selected.forEach(b => b.zIndexUp());
            }
        },
        {
            name: "zIndexDown",
            label: "Push backward",
            visible: (selected: Block[], editor: Editor) => {
                return selected.every(b => b.editorSupport().zIndex && !b.locked) && selected.length >= 1;
            },
            action: (selected: Block[], editor: Editor) => {
                selected.forEach(b => b.zIndexDown());
            }
        },
        {
            name: "zIndexTop",
            label: "Push to front",
            visible: (selected: Block[], editor: Editor) => {
                return selected.every(b => b.editorSupport().zIndex && !b.locked) && selected.length >= 1;
            },
            action: (selected: Block[], editor: Editor) => {
                selected.forEach(b => b.zIndexMaxUp());
            }
        },
        {
            name: "zIndexBottom",
            label: "Push to back",
            visible: (selected: Block[], editor: Editor) => {
                return selected.every(b => b.editorSupport().zIndex && !b.locked) && selected.length >= 1;
            },
            action: (selected: Block[], editor: Editor) => {
                selected.forEach(b => b.zIndexMaxDown());
            }
        }
        // TODO: move up to specific classes & add way to register custom actions
    ]

    constructor(editor: Editor) {
        this.editor = editor;

        this.setupContext();
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
                action.action(this.editor.getSelector().getSelectedBlocks(), this.editor);

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
            if(event.button !== 0) return;

            this.active = false;
            this.handleVisibility();
        });
    }

    public handleContext() {
        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";

        let visibleActions = 0;

        for (const action of this.getActions()) {
            const visible = action.visible(this.editor.getSelector().getSelectedBlocks(), this.editor);
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

    private handleVisibility() {
        if (!this.active) {
            this.element.classList.remove("editor-context--active");
        } else {
            this.element.classList.add("editor-context--active");
        }
    }


}
