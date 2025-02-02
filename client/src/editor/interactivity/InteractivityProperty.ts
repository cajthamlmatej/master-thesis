import {AggregatorProperty} from "@/editor/property/type/AggregatorProperty";
import {NumberProperty} from "@/editor/property/type/NumberProperty";
import {Property} from "@/editor/property/Property";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockInteractiveProperty, BlockInteractivity} from "@/editor/interactivity/BlockInteractivity";

export class InteractivityProperty<T extends EditorBlock = EditorBlock> extends Property<T> {


    constructor() {
        super();
    }

    getPriority(): number {
        return 1000;
    }

    isVisible(): boolean {
        return this.blocks.length == 1;
    }

    setup(): void {
        this.element.innerHTML = `
            <div class="header">
                <label>Interactivity</label>

                <button><span class="mdi mdi-plus"></span></button>
            </div>
            <div class="interactivity-container">
            </div>
        `;

        const button = this.element.querySelector("button") as HTMLButtonElement;

        button.addEventListener("click", () => {
            this.blocks[0].interactivity.push({
                event: "CLICKED",
                action: "CHANGE_SLIDE",
                slideType: "NEXT",
                condition: "ALWAYS",
                on: "SELF",
                property: "Position X",
                blocks: [],
                time: 0,
                slideIndex: 0,
                value: "",
                timeFrom: "OPEN"
            } as any);
            this.render();
        });

        this.render();
    }

    private render() {
        const container = this.element.querySelector(".interactivity-container") as HTMLElement;
        container.innerHTML = "";

        for(let interactivity of this.blocks[0].interactivity) {
            container.appendChild(this.renderInteractivity(interactivity));
        }
    }

    private renderInteractivity(interactivity: BlockInteractivity): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("interactivity");
        const editor = this.blocks[0].getEditor();

        element.innerHTML += `<div class="field">
                        <span class="label">Event</span>
                        <div class="value">
                            <select data-property="event">
                                <option value="CLICKED">Clicked</option>
                                <option value="HOVER_START">Hover start</option>
                                <option value="HOVER_END">Hover end</option>
                                <option disabled value="DRAG_START">Drag start</option>
                                <option disabled value="DRAG_END">Drag end</option>
                            </select>
                        </div>
                    </div>`;
        element.innerHTML += `
                    <div class="field">
                        <span class="label">Do</span>
                        <div class="value">
                            <select data-property="action">
                                <option value="CHANGE_PROPERTY">Change property</option>
                                <option value="RESET_PROPERTY">Reset property</option>
                                <option value="CHANGE_SLIDE">Change slide</option>
                            </select>
                        </div>
                    </div>`;

        if(interactivity.action == 'CHANGE_PROPERTY' || interactivity.action == 'RESET_PROPERTY') {
            element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">On</span>
                        <div class="value">
                            <select data-property="on">
                                <option value="SELF">Self</option>
                                <option value="ALL">All on slide</option>
                                <option value="SELECTED">Selected blocks</option>
                            </select>
                        </div>
                    </div>`;

            if(interactivity.on == 'SELECTED') {
                const blocks = editor.getBlocks();

                const blocksPairs = [];
                const seenTypes = new Map<string, number>();

                for(let block of blocks) {
                    const type = block.type;

                    if(!seenTypes.has(type)) {
                        seenTypes.set(type, 0);
                    }

                    seenTypes.set(type, seenTypes.get(type)! + 1);

                    blocksPairs.push({
                        id: block.id,
                        name: block.type + " " + seenTypes.get(type)
                    });
                }

                element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">Blocks</span>
                        <div class="value">
                            <select data-property="blocks" multiple>
                                ${blocksPairs.map(block => `<option value="${block.id}">${block.name}</option>`).join("")}
                            </select>
                        </div>
                    </div>`;
            }

            const selectedBlocks = [];

            if(interactivity.on == 'SELF') {
                selectedBlocks.push(this.blocks[0]);
            } else if(interactivity.on == 'ALL') {
                selectedBlocks.push(...editor.getBlocks());
            } else if(interactivity.on == 'SELECTED') {
                selectedBlocks.push(...editor.getBlocks().filter(block => (interactivity.blocks ?? []).includes(block.id)));
            }

            const properties = [] as Omit<BlockInteractiveProperty, "change" | "reset">[];

            for(let block of selectedBlocks) {
                for(let property of block.getInteractivityProperties()) {
                    properties.push(property);
                }
            }

            const propertiesPairs = [] as {id: string, name: string}[];

            for(let property of properties) {
                if(propertiesPairs.some(p => p.id == property.label)) {
                    continue;
                }

                let pass = true;
                for(let block of selectedBlocks) {
                    // All properties must be present on all blocks
                    if(!block.getInteractivityProperties().some(p => p.label == property.label)) {
                        pass = false;
                        break;
                    }
                }

                if(!pass) {
                    continue;
                }

                propertiesPairs.push({
                    id: property.label,
                    name: property.label
                });
            }

            element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">Property</span>
                        <div class="value">
                            <select data-property="property">
                                ${propertiesPairs.map(property => `<option value="${property.id}">${property.name}</option>`).join("")}
                                ${interactivity.action == 'RESET_PROPERTY' ? '<option value="ALL">All properties</option>' : ''}
                            </select>
                        </div>
                    </div>`;

            if(interactivity.action == 'CHANGE_PROPERTY') {
                element.innerHTML += `<div class="field field--sub">
                        <span class="label">Value</span>
                        <div class="value">
                            <input type="text" data-property="value">
                        </div>
                    </div>`;
            }
            // TODO: up based on property type (number, color, text, etc)
        } else if(interactivity.action == 'CHANGE_SLIDE') {
            element.innerHTML += `
                <div class="field field--sub">
                    <span class="label">Slide</span>
                    <div class="value">
                        <select data-property="slideType">
                            <option value="NEXT">Next</option>
                            <option value="PREVIOUS">Previous</option>
                            <option value="FIRST">First</option>
                            <option value="LAST">Last</option>
                            <option value="RANDOM">Random</option>
                            <option value="SLIDE">Slide</option>
                        </select>
                    </div>
                </div>`;

            if(interactivity.slideType == 'SLIDE') {
                element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">Slide number</span>
                        <div class="value">
                            <input type="number" data-property="slideIndex">
                        </div>
                    </div>`;
            }
        }

        element.innerHTML += `
                    <div class="field">
                        <span class="label">Only if</span>
                        <div class="value">
                            <select data-property="condition">
                                <option value="ALWAYS">Always</option>
                                <option value="TIME_PASSED">Time passed</option>
                            </select>
                        </div>
                    </div>`;

        if(interactivity.condition == 'TIME_PASSED') {
            element.innerHTML += `
                    <div class="field">
                        <span class="label">Count from</span>
                        <div class="value">
                            <select data-property="condition">
                                <option value="OPEN">Of material</option>
                                <option value="SLIDE">Of slide</option>
                            </select>
                        </div>
                    </div>`;
            element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">Time</span>
                        <div class="value">
                            <input type="number" value="${interactivity.time ?? ''}" data-property="time">
                            <span class="unit">s</span>
                        </div>
                    </div>`;
        }

        element.innerHTML += `<div class="footer">
            <button class="delete"><span class="mdi mdi-delete"></span></button>
            <button class="duplicate"><span class="mdi mdi-checkbox-multiple-blank"></span></button>
        </div>`;

        for(const field of element.querySelectorAll("[data-property]") as unknown as HTMLElement[]) {
            if(field instanceof HTMLInputElement) {
                let value = interactivity[field.getAttribute("data-property") as keyof BlockInteractivity] as any;

                if(!value) {
                    value = "";
                }

                field.value = value;
            } else if(field instanceof HTMLSelectElement) {
                if(field.multiple) {
                    for(const option of field.querySelectorAll("option")) {
                        if ((interactivity[field.getAttribute("data-property") as keyof BlockInteractivity] as unknown as string[] ?? []).includes(option.value)) {
                            option.selected = true;
                        }
                    }
                } else {
                    for(const option of field.querySelectorAll("option")) {
                        if(option.value == interactivity[field.getAttribute("data-property") as keyof BlockInteractivity]) {
                            option.selected = true;
                        }
                    }
                }
            }

            field.addEventListener("change", () => {
                let value: any;
                if(field instanceof HTMLInputElement) {
                    value = field.value;
                } else if(field instanceof HTMLSelectElement) {
                    // If multiple, get all selected values
                    if(field.multiple) {
                        value = [];
                        for(const option of field.options) {
                            if(option.selected) {
                                value.push(option.value);
                            }
                        }
                    } else {
                        value = field.options[field.selectedIndex].value;
                    }
                } else {
                    throw new Error("Unknown field type");
                }

                // @ts-ignore // I think this is a bug in TypeScript
                interactivity[field.getAttribute("data-property") as keyof BlockInteractivity] = value;

                // if(field instanceof HTMLInputElement || (field instanceof HTMLSelectElement && !field.multiple)) {
                    this.render();
                // }
            });
        }

        element.querySelector(".delete")?.addEventListener("click", () => {
            this.blocks[0].interactivity = this.blocks[0].interactivity.filter(i => i !== interactivity);
            this.render();
        });
        element.querySelector(".duplicate")?.addEventListener("click", () => {
            this.blocks[0].interactivity.push(JSON.parse(JSON.stringify(interactivity)));
            this.render();
        });

        return element;
    }


    destroy(): void {
        this.element.innerHTML = "";
    }

}
