import type Editor from "@/editor/Editor";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {colorFromSeed} from "@/utils/Generators";
import {boundingBoxOfElements} from "@/utils/Area";
import {interpolateColor} from "@/utils/Color";

interface GroupArea {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export default class EditorGroupAreaVisualiser {
    private editor: Editor;

    private element!: HTMLElement;
    private areas = new Map<string, GroupArea>();

    constructor(editor: Editor) {
        this.editor = editor;

        this.editor.events.BLOCK_GROUP_CHANGED.on((blocks) => this.handleGroupsChanged(blocks));
        this.editor.getSelector().events.AREA_CHANGED.on(() => this.recalculate());

        const groupAreaElement = document.createElement("div");
        groupAreaElement.classList.add("editor-group-areas");

        this.editor.getEditorElement().appendChild(groupAreaElement);

        this.element = groupAreaElement;
    }

    public recalculate() {
        this.areas.clear();

        const uniqueGroups = this.editor.getSelector().getSelectedBlocks()
            .reduce((acc, block) => acc.add(block), new Set<EditorBlock>());

        for (const block of uniqueGroups) {
            if (!block.group) continue;

            const groupBlocks = this.editor.getBlocksInGroup(block.group);

            if (groupBlocks.length <= 1) continue;

            const area = boundingBoxOfElements(groupBlocks.map(b => b.element), this.editor);

            this.areas.set(block.group, {
                x: area.x,
                y: area.y,
                width: area.width,
                height: area.height,
                color: interpolateColor(0.2, colorFromSeed(block.group), window.getComputedStyle(document.body).getPropertyValue("--color-primary")) // TODO: lepsi barvicky :)
            });
        }

        this.visualise();
    }

    private handleGroupsChanged(blocks: EditorBlock[]) {
        this.recalculate();
    }

    private visualise() {
        if (this.areas.size === 0) {
            this.element.innerHTML = "";
            return;
        }

        let html = "";

        for (const [group, area] of this.areas) {
            html += `<div class="group-area" style="left: ${area.x}px; top: ${area.y}px; width: ${area.width}px; height: ${area.height}px; --group-area-color: ${area.color}"></div>`;
        }

        this.element.innerHTML = html;
    }

}
