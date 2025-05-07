import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";
import { sanitizeTiptapEditorHTML } from "@/utils/Sanitize";

export class TextPlayerBlock extends PlayerBlock {
    @BlockSerialize("content")
    private content: string;
    @BlockSerialize("fontSize")
    private fontSize: number;

    private baseContent: string;

    constructor(base: BlockConstructorWithoutType, content: string, fontSize: number) {
        super({
            ...base,
            type: "text"
        });
        this.content = content;
        this.fontSize = fontSize;
        this.baseContent = content;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-text");

        const content = document.createElement("div");

        content.classList.add("block-content");

        content.innerHTML = sanitizeTiptapEditorHTML(this.content);

        element.appendChild(content);

        return element;
    }

    override synchronize() {
        super.synchronize();

        const content = this.element.querySelector(".block-content") as HTMLElement;
        content.style.fontSize = this.fontSize + "px";
        content.style.width = this.size.width + "px";

        content.innerHTML = this.content;
    }


    getInteractivityProperties(): BlockInteractiveProperty[] {
        return [
            ...super.getInteractivityProperties(),
            {
                label: "content",
                getBaseValue: () => this.baseContent,
                change: (value: any, relative: boolean) => {
                    this.content = value.toString();

                    this.synchronize();
                    return true;
                }
            }
        ];
    }
}
