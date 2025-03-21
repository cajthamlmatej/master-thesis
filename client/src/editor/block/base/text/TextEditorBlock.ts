import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {Property} from "@/editor/property/Property";
import {Editor} from '@tiptap/core'
import {StarterKit} from '@tiptap/starter-kit'
import {Underline} from "@tiptap/extension-underline";
import {Subscript} from '@tiptap/extension-subscript'
import {Superscript} from '@tiptap/extension-superscript'
import {TextStyle} from '@tiptap/extension-text-style'
import {Color} from '@tiptap/extension-color'
import {FontFamily} from '@tiptap/extension-font-family'
import {TextFormattingProperty} from "@/editor/block/base/text/property/TextFormattingProperty";
import {TextAlign} from "@tiptap/extension-text-align";
import {FontSize} from "@/utils/font-size";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";

export class TextEditorBlock extends EditorBlock {
    @BlockSerialize("content")
    content: string;
    @BlockSerialize("fontSize")
    private fontSize: number;
    private editable: boolean = false;
    private removed = false;
    private textEditor: Editor | null = null;

    constructor(base: BlockConstructorWithoutType, content: string, fontSize: number) {
        super({
            ...base,
            type: "text"
        });
        this.content = content;
        this.fontSize = fontSize;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-text");

        const content = document.createElement("div");

        content.classList.add("block-content");
        element.appendChild(content);

        this.setupEditor(content);

        return element;
    }

    private setupEditor(content: Element | undefined = undefined) {
        if (this.textEditor) {
            this.textEditor.destroy();
        }
        if (!content) {
            content = this.element.querySelector(".block-content")! as HTMLElement;

            if(!content) return;
        }

        this.textEditor = new Editor({
            element: content,
            extensions: [
                StarterKit,
                Underline,
                Superscript,
                Subscript,
                TextStyle,
                Color,
                FontFamily,
                TextAlign.configure({
                    types: ['heading', 'paragraph'],
                }),
                FontSize
            ],
            content: this.content,
            editable: false,
            onUpdate: ({editor}) => {
                this.changeContent(editor.getHTML());
                this.matchRenderedHeight();
            },
        });
    }

    public override processDataChange(data: any) {
        super.processDataChange(data);

        this.setupEditor();
    }

    override editorSupport() {
        return {
            group: true,
            selection: true,
            movement: true,
            proportionalResizing: true,
            nonProportionalResizingX: true,
            nonProportionalResizingY: false,
            rotation: true,
            zIndex: true,
            lock: true,
        }
    }

    override getContent() {
        return this.element.querySelector(".block-content")! as HTMLElement;
    }

    override canCurrentlyDo(action: "select" | "move" | "resize" | "rotate"): boolean {
        if (this.locked && action !== "select") {
            return false;
        }

        if (action === "move" || action === "resize" || action === "rotate") {
            return !this.editable;
        }

        return true;
    }

    override synchronize() {
        super.synchronize();

        const content = this.getContent();
        content.style.fontSize = this.fontSize + "px";

        // While scaling (the scaling was not completed yet), we don't want to set the width
        if (!content.style.transform.includes("scale")) {
            content.style.width = this.size.width + "px";
        }

        if (this.content !== this.textEditor?.getHTML()) {
            if (this.textEditor && !this.removed) {
                try {
                    this.textEditor.commands.setContent(this.content);
                } catch (e) {
                    // note(Matej): Sometimes the editor screams about "mismatched transition", frequently
                    //     when the content is being changed while the block is being resized or destroyed.
                    // AFAIK we can just ignore this error, as it doesn't seem to have any effect on the editor.
                }
            }
        }
    }

    override clone(): EditorBlock {
        return new TextEditorBlock(this.getCloneBase(), this.content, this.fontSize);
    }

    override getProperties(): Property<this>[] {
        return [
            ...super.getProperties(),
            // new TextProperty(),
            new TextFormattingProperty(),
        ];
    }

    changeContent(value: string) {
        this.content = value;

        this.synchronize();

        this.editor.events.BLOCK_CONTENT_CHANGED.emit(this);
    }

    /**
     * Get the text editor instance if it exists.
     */
    public getTextEditor() {
        return this.textEditor;
    }

    public canBeEdited() {
        return this.editable;
    }

    @BlockEventListener(BlockEvent.SELECTED)
    private onSelected() {
        this.element.addEventListener("keydown", this.onKeyDown.bind(this));
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape" && this.editable) {
            event.preventDefault();
            event.stopPropagation();
            this.editable = false;
            this.textEditor?.setOptions({
                editable: false,
            });

            this.editor.events.BLOCK_CONTENT_CHANGED.emit(this);
            this.synchronize();
        }
    }

    @BlockEventListener(BlockEvent.CLICKED)
    private onBlockClicked() {
        this.textEditor?.setOptions({
            editable: true,
        });
        this.editable = true;
        this.synchronize();
    }

    @BlockEventListener(BlockEvent.UNMOUNTED)
    private onUnmount() {
        this.removed = true;

        if (this.textEditor) {
            this.textEditor.destroy();
        }
    }

    @BlockEventListener(BlockEvent.DESELECTED)
    private onDeselected() {
        if (this.removed) {
            // Block was removed, do not do anything.
            // note(Matej): This exist because this deselect call removeBlock, which calls onDeselected again
            return;
        }

        this.textEditor?.setOptions({
            editable: false,
        });
        this.editable = false;
        this.synchronize();

        this.element.removeEventListener("keydown", this.onKeyDown.bind(this));
        this.editor.events.HISTORY.emit();
    }

    @BlockEventListener(BlockEvent.ROTATION_STARTED)
    @BlockEventListener(BlockEvent.ROTATION_ENDED)
    @BlockEventListener(BlockEvent.MOVEMENT_STARTED)
    private blur() {
        this.getContent().blur();
    }

    @BlockEventListener(BlockEvent.RESIZING_ENDED)
    private onResizeCompleted(type: "PROPORTIONAL" | "NON_PROPORTIONAL", before: { width: number, height: number }) {
        const content = this.getContent();

        if (type === "PROPORTIONAL") {
            this.fontSize = this.fontSize * (this.size.width / before.width);
        }

        // Remove scaling
        content.style.transform = "";

        this.synchronize();
    }

    getInteractivityProperties(): Omit<BlockInteractiveProperty & {
        relative: boolean;
        animate: boolean
    }, "change" | "reset" | "getBaseValue">[] {
        return [
            ...super.getInteractivityProperties(),
            {
                label: "content",
                relative: false,
                animate: false,
            }
        ];
    }


}
