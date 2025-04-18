import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {Property} from "@/editor/property/Property";
import {$t} from "@/translation/Translation";

export class ChatEditorBlock extends EditorBlock {
    constructor(base: BlockConstructorWithoutType) {
        super({
            ...base,
            type: "chat",
        });
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-chat");

        element.innerHTML = `<div class="header"><span>${$t('blocks.chat.title')}</span> <div class="actions"><div data-id="pause" class="button mdi mdi-pause"></div></div></div><div class="chat"></div><div class="send"><input data-id="content" disabled type="text"><button>${$t('blocks.chat.send')}</button></div>`;

        const chat = element.querySelector(".chat") as HTMLDivElement;
        chat.innerHTML = `<div class="message"><div class="message-author">${$t('blocks.chat.presenter')}</div><div class="message-content">${$t('blocks.chat.message-example')}</div></div>`;

        return element;
    }

    override editorSupport() {
        return {
            group: true,
            selection: true,
            movement: true,
            proportionalResizing: true,
            nonProportionalResizingX: true,
            nonProportionalResizingY: true,
            rotation: true,
            zIndex: true,
            lock: true,
        }
    }

    override clone(): EditorBlock {
        return new ChatEditorBlock(this.getCloneBase());
    }
}
