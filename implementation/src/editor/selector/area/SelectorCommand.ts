import type EditorSelectorArea from "@/editor/selector/area/EditorSelectorArea";

export abstract class SelectorCommand {

    abstract getElements(): HTMLElement | HTMLElement[];

    abstract execute(event: MouseEvent, element: HTMLElement, selectorArea: EditorSelectorArea): void;

}
