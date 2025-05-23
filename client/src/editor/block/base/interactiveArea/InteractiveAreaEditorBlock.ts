import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";
import {Property} from "@/editor/property/Property";
import {$t} from "@/translation/Translation";

export class InteractiveAreaEditorBlock extends EditorBlock {
    constructor(base: BlockConstructorWithoutType) {
        super({
            ...base,
            type: "interactiveArea",
        });
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-interactiveArea");

        return element;
    }

    synchronize() {
        super.synchronize();

        this.element.style.zIndex = "1001";
        this.element.style.setProperty("--text", "'" + $t("blocks.interactiveArea.warning") + "'");
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
            zIndex: false,
            lock: true,
        }
    }

    override clone(): EditorBlock {
        return new InteractiveAreaEditorBlock(this.getCloneBase());
    }

    override getInteractivityProperties(): Omit<BlockInteractiveProperty & {
        relative: boolean;
        animate: boolean
    }, "change" | "reset" | "getBaseValue">[] {
        return [
            ...super.getInteractivityProperties().filter((p) => !["Opacity", "Z-Index"].includes(p.label))
        ]
    }

    override getProperties(): Property<this>[] {
        return [
            ...super.getProperties().filter((p) => !["OpacityProperty"].includes(p.getID()))
        ]
    }
}
