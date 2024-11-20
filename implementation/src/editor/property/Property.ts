import type {EditorProperty} from "@/editor/property/EditorProperty";
import {EditorBlock} from "@/editor/block/EditorBlock";

export abstract class Property {
    protected element!: HTMLElement;
    protected editorProperty!: EditorProperty;
    protected blocks!: EditorBlock[];

    public initialize(element: HTMLElement, editorProperty: EditorProperty, blocks: EditorBlock[]) {
        this.element = element;
        this.editorProperty = editorProperty;
        this.blocks = blocks;
    }

    public getID(): string {
        return this.constructor.name;
    }

    public abstract isVisible(): boolean;

    public abstract setup(): void;

    public abstract destroy(): void;
}
