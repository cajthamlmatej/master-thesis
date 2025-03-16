import {Property} from "@/editor/property/Property";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {
    BlockInteractiveProperty,
    BlockInteractivity,
    BlockInteractivityAction
} from "@/editor/interactivity/BlockInteractivity";
import {$t} from "@/translation/Translation";
import {v4} from "uuid";

export class InteractivityProperty<T extends EditorBlock = EditorBlock> extends Property<T> {


    getPriority(): number {
        return 1000;
    }

    isVisible(): boolean {
        return this.blocks.length == 1;
    }

    setup(): void {
        this.element.innerHTML = `
            <div class="header">
                <label>${$t("property.interactivity.label")}</label>

                <button><span class="mdi mdi-plus"></span></button>
            </div>
            <div class="interactivity-container">
            </div>
        `;

        const button = this.element.querySelector("button") as HTMLButtonElement;

        button.addEventListener("click", () => {
            let uniqueId: string;

            do {
                uniqueId = Math.random().toString(36).substring(7);
            } while (this.blocks[0].interactivity.some(i => i.id == uniqueId));

            this.blocks[0].interactivity.push({
                id: uniqueId,
                event: "CLICKED",
                timerType: "TIMEOUT",
                // timerFrom: "OPEN",
                timerTime: 0,

                actions: [
                    {
                        id: v4(),
                        action: "CHANGE_SLIDE",
                        slideType: "NEXT",
                        on: "SELF",
                        property: "position-x",
                        blocks: [],
                        slideIndex: 0,
                        value: "",
                        relative: false,
                        animate: false,
                        duration: 0,
                        easing: "LINEAR",
                        changeVariable: "",
                        changeVariableValue: "",
                    }
                ],

                condition: "ALWAYS",
                time: 0,
                timeFrom: "OPEN",
                ifVariable: "",
                ifVariableValue: "",
                ifVariableOperator: "EQUALS",
            } as any);
            this.render();
        });

        this.render();
    }

    destroy(): void {
        this.element.innerHTML = "";
    }

    private render() {
        const container = this.element.querySelector(".interactivity-container") as HTMLElement;
        container.innerHTML = "";

        for (let interactivity of this.blocks[0].interactivity) {
            container.appendChild(this.renderInteractivity(interactivity));
        }
    }

    private renderInteractivityEventTimer(interactivity: BlockInteractivity): HTMLElement {
        const element = document.createElement("div");

        if (interactivity.event != 'TIMER')
            return element;

        element.innerHTML += `<div class="field field--sub">
            <span class="label">${$t("property.interactivity.timer.label")}</span>
            <div class="value">
                <select data-property="timerType">
                    <option value="TIMEOUT">${$t("property.interactivity.timer.TIMEOUT")}</option>
                    <option value="REPEAT">${$t("property.interactivity.timer.REPEAT")}</option>
                    <option value="NOW-REPEAT">${$t("property.interactivity.timer.NOW-REPEAT")}</option>
                </select>
            </div>
        </div>
        `;

        element.innerHTML += `<div class="field field--sub">
            <span class="label">${interactivity.timerType == 'TIMEOUT' ? $t("property.interactivity.timer.TIMEOUT-selected") : $t("property.interactivity.timer.REPEAT-selected")}</span>
            <div class="value">
                <input type="number" data-property="timerTime">
                <span class="unit">${$t("unit.ms")}</span>
            </div>
        </div>`;

        return element;
    }

    private renderInteractivityEvent(interactivity: BlockInteractivity): HTMLElement {
        const element = document.createElement("div");

        element.innerHTML += `<div class="field">
            <span class="label">${$t("property.interactivity.event.label")}</span>
            <div class="value">
                <select data-property="event">
                    <option value="CLICKED">${$t("property.interactivity.event.CLICKED")}</option>
                    <option value="HOVER_START">${$t("property.interactivity.event.HOVER_START")}</option>
                    <option value="HOVER_END">${$t("property.interactivity.event.HOVER_END")}</option>
                    <option value="TIMER">${$t("property.interactivity.event.TIMER")}</option>
                    <option value="SLIDE_LOAD">${$t("property.interactivity.event.SLIDE_LOAD")}</option>
<!--                                <option disabled value="DRAG_START">Drag start</option>--> <!-- TODO: blocks dont yet have drag support -->
<!--                                <option disabled value="DRAG_END">Drag end</option>-->
                </select>
            </div>
        </div>`;

        if (interactivity.event == 'TIMER') {
            element.appendChild(this.renderInteractivityEventTimer(interactivity));
        }

        return element;
    }

    private renderInteractivityActionAction(action: BlockInteractivityAction): HTMLElement {
        const element = document.createElement("div");


        element.innerHTML += `
            <div class="field">
                <span class="label">${$t("property.interactivity.action.label")}</span>
                <div class="value">
                    <select data-property="action">
                        <option value="CHANGE_PROPERTY">${$t("property.interactivity.action.CHANGE_PROPERTY")}</option>
                        <option value="RESET_PROPERTY">${$t("property.interactivity.action.RESET_PROPERTY")}</option>
                        <option value="CHANGE_SLIDE">${$t("property.interactivity.action.CHANGE_SLIDE")}</option>
                        <option value="CHANGE_VARIABLE">${$t("property.interactivity.action.CHANGE_VARIABLE")}</option>
                    </select>
                </div>
            </div>`;

        return element;
    }

    private renderInteractivityActionSlide(action: BlockInteractivityAction): HTMLElement {
        const element = document.createElement("div");

        if (action.action != 'CHANGE_SLIDE')
            return element;

        element.innerHTML += `
                <div class="field field--sub">
                    <span class="label">${$t("property.interactivity.slide.label")}</span>
                    <div class="value">
                        <select data-property="slideType">
                            <option value="NEXT">${$t("property.interactivity.slide.NEXT")}</option>
                            <option value="PREVIOUS">${$t("property.interactivity.slide.PREVIOUS")}</option>
                            <option value="FIRST">${$t("property.interactivity.slide.FIRST")}</option>
                            <option value="LAST">${$t("property.interactivity.slide.LAST")}</option>
                            <option value="RANDOM">${$t("property.interactivity.slide.RANDOM")}</option>
                            <option value="SLIDE">${$t("property.interactivity.slide.SLIDE")}</option>
                        </select>
                    </div>
                </div>`;

        if (action.slideType == 'SLIDE') {
            element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">${$t("property.interactivity.slide.index")}</span>
                        <div class="value">
                            <input type="number" data-property="slideIndex">
                        </div>
                    </div>`;
        }

        return element;
    }

    private renderInteractivityActionVariable(action: BlockInteractivityAction): HTMLElement {
        const actionElement = document.createElement("div");

        actionElement.innerHTML += `
                <div class="field field--sub">
                    <span class="label">${$t("property.interactivity.variable.name")}</span>
                    <div class="value">
                        <input type="text" data-property="changeVariable">
                    </div>
                </div>`;
        actionElement.innerHTML += `
                <div class="field field--sub">
                    <span class="label">${$t("property.interactivity.variable.value")}</span>
                    <div class="value">
                        <input type="text" data-property="changeVariableValue">
                    </div>
                </div>`;

        return actionElement;
    }

    private renderInteractivityActionFooter(action: BlockInteractivityAction): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("footer");

        element.innerHTML += `
                <button class="delete-action"><span class="mdi mdi-delete"></span></button>
                <button class="duplicate-action"><span class="mdi mdi-checkbox-multiple-blank"></span></button>
            `;

        return element;
    }

    private renderInteractivityActionProperty(action: BlockInteractivityAction): HTMLElement {
        const element = document.createElement("div");
        const editor = this.blocks[0].getEditor();

        if (action.action != 'CHANGE_PROPERTY' && action.action != 'RESET_PROPERTY')
            return element;

        element.innerHTML += `
                <div class="field field--sub">
                    <span class="label">${$t("property.interactivity.on.label")}</span>
                    <div class="value">
                        <select data-property="on">
                            <option value="SELF">${$t("property.interactivity.on.SELF")}</option>
                            <option value="ALL">${$t("property.interactivity.on.ALL")}</option>
                            <option value="SELECTED">${$t("property.interactivity.on.SELECTED")}</option>
                        </select>
                    </div>
                </div>`;

        if (action.on == 'SELECTED') {
            const blocks = editor.getBlocks();

            const blocksPairs = [];
            const seenTypes = new Map<string, number>();

            for (let block of blocks) {
                const type = block.type;

                if (!seenTypes.has(type)) {
                    seenTypes.set(type, 0);
                }

                seenTypes.set(type, seenTypes.get(type)! + 1);

                blocksPairs.push({
                    id: block.id,
                    name: block.type + " " + seenTypes.get(type), // TODO: this needs overhaul
                });
            }

            element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">${$t("property.interactivity.on.blocks")}</span>
                        <div class="value">
                            <select data-property="blocks" multiple>
                                ${blocksPairs.map(block => `<option value="${block.id}">${block.name}</option>`).join("")}
                            </select>
                        </div>
                    </div>`;
        }

        const selectedBlocks = [];

        if (action.on == 'SELF') {
            selectedBlocks.push(this.blocks[0]);
        } else if (action.on == 'ALL') {
            selectedBlocks.push(...editor.getBlocks());
        } else if (action.on == 'SELECTED') {
            selectedBlocks.push(...editor.getBlocks().filter(block => (action.blocks ?? []).includes(block.id)));
        }

        const properties = [] as Omit<BlockInteractiveProperty & {
            relative: boolean,
            animate: boolean
        }, "change" | "getBaseValue">[];

        for (let block of selectedBlocks) {
            for (let property of block.getInteractivityProperties()) {
                properties.push(property);
            }
        }

        const propertiesPairs = [] as { id: string, name: string }[];

        for (let property of properties) {
            if (propertiesPairs.some(p => p.id == property.label)) {
                continue;
            }

            let pass = true;
            for (let block of selectedBlocks) {
                // All properties must be present on all blocks
                if (!block.getInteractivityProperties().some(p => p.label == property.label)) {
                    pass = false;
                    break;
                }
            }

            if (!pass) {
                continue;
            }

            propertiesPairs.push({
                id: property.label,
                name: $t("property.interactivity.properties." + property.label),
            });
        }

        element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">${$t("property.interactivity.property.label")}</span>
                        <div class="value">
                            <select data-property="property">
                                ${propertiesPairs.map(property => `<option value="${property.id}">${property.name}</option>`).join("")}
                                ${action.action == 'RESET_PROPERTY' ? `<option value="ALL">${$t("property.interactivity.property.ALL")}</option>` : ''}
                            </select>
                        </div>
                    </div>`;

        let property = properties.find(p => p.label == action.property);

        if (action.action == 'CHANGE_PROPERTY') {
            element.innerHTML += `<div class="field field--sub">
                        <span class="label">${$t("property.interactivity.property.value")}</span>
                        <div class="value">
                            <input type="text" data-property="value">
                        </div>
                    </div>`;

            if (property && property.relative) {
                element.innerHTML += `<div class="field field--sub">
                        <span class="label">${$t("property.interactivity.property.relative")}</span>
                        <div class="value">
                            <input type="checkbox" data-property="relative" id="relative-${action.id}">
                            <label class="checkbox-label ${action.relative ? 'checked' : ''}" for="relative-${action.id}"></label>
                        </div>
                    </div>`;
            }
        }

        if ((property && property.animate) || action.property == "ALL") {
            element.innerHTML += `<div class="field field--sub">
                            <span class="label">${$t("property.interactivity.animate.label")}</span>
                            <div class="value">
                                <input type="checkbox" data-property="animate" id="animate-${action.id}">
                                <label class="checkbox-label ${action.animate ? 'checked' : ''}" for="animate-${action.id}"></label>
                            </div>
                        </div>`;

            if (action.animate) {
                element.innerHTML += `<div class="field field--sub">
                                <span class="label">${$t("property.interactivity.animate.duration")}</span>
                                <div class="value">
                                    <input type="number" data-property="duration">
                                    <span class="unit">${$t("unit.ms")}</span>
                                </div>
                            </div>`;
                element.innerHTML += `<div class="field field--sub">
                            <span class="label">${$t("property.interactivity.animate.easing")}</span>
                            <div class="value">
                                <select data-property="easing">
                                    <option value="LINEAR">${$t("property.interactivity.animate.easings.LINEAR")}</option>
                                    <option value="EASE">${$t("property.interactivity.animate.easings.EASE")}</option>
                                    <option value="EASE_IN">${$t("property.interactivity.animate.easings.EASE_IN")}</option>
                                    <option value="EASE_OUT">${$t("property.interactivity.animate.easings.EASE_OUT")}</option>
                                    <option value="EASE_IN_OUT">${$t("property.interactivity.animate.easings.EASE_IN_OUT")}</option>
                                    <option value="STEPS_4">${$t("property.interactivity.animate.easings.STEPS_4")}</option>
                                    <option value="STEPS_6">${$t("property.interactivity.animate.easings.STEPS_6")}</option>
                                    <option value="STEPS_8">${$t("property.interactivity.animate.easings.STEPS_8")}</option>
                                    <option value="STEPS_10">${$t("property.interactivity.animate.easings.STEPS_10")}</option>
                                </select>
                            </div>
                        </div>`;
            }
        }

        return element;
    }

    private renderInteractivityAction(action: BlockInteractivityAction): HTMLElement {
        const actionElement = document.createElement("div");
        actionElement.classList.add("action");
        actionElement.dataset.id = action.id;

        actionElement.appendChild(this.renderInteractivityActionAction(action));

        if (action.action == 'CHANGE_PROPERTY' || action.action == 'RESET_PROPERTY') {
            actionElement.appendChild(this.renderInteractivityActionProperty(action));
        } else if (action.action == 'CHANGE_SLIDE') {
            actionElement.appendChild(this.renderInteractivityActionSlide(action));
        } else if (action.action == 'CHANGE_VARIABLE') {
            actionElement.appendChild(this.renderInteractivityActionVariable(action));
        }

        actionElement.appendChild(this.renderInteractivityActionFooter(action));

        return actionElement;
    }

    private renderInteractivityActions(interactivity: BlockInteractivity): HTMLElement {
        const element = document.createElement("div");

        const actionsElement = document.createElement("div");
        actionsElement.classList.add("actions");

        actionsElement.innerHTML += `
            <header>
                <span>${$t("property.interactivity.actions.title")}</span>

                <div class="buttons">
                    <button class="plus-action"><span class="mdi mdi-plus"></span></button>
                </div>
            </header>
        `

        element.appendChild(actionsElement);

        for (let action of interactivity.actions) {
            actionsElement.appendChild(this.renderInteractivityAction(action));
        }

        return element;
    }

    private renderInteractivityConditionTimer(interactivity: BlockInteractivity): HTMLElement {
        const element = document.createElement("div");

        if (interactivity.condition != 'TIME_PASSED')
            return element;

        element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">${$t("property.interactivity.time-passed.label")}</span>
                        <div class="value">
                            <select data-property="timeFrom">
                                <option value="OPEN">${$t("property.interactivity.time-passed.OPEN")}</option>
                                <option value="SLIDE">${$t("property.interactivity.time-passed.SLIDE")}</option>
                            </select>
                        </div>
                    </div>`;
        element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">${$t("property.interactivity.time-passed.time")}</span>
                        <div class="value">
                            <input type="number" value="${interactivity.time ?? ''}" data-property="time">
                            <span class="unit">${$t("unit.ms")}</span>
                        </div>
                    </div>`;

        return element;
    }

    private renderInteractivityConditionVariable(interactivity: BlockInteractivity): HTMLElement {
        const element = document.createElement("div");

        element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">${$t('property.interactivity.variable.name')}</span>
                        <div class="value">
                            <input type="text" data-property="ifVariable">
                        </div>
                    </div>`;
        element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">${$t('property.interactivity.variable.operator')}</span>
                        <div class="value">
                            <select data-property="ifVariableOperator">
                                <option value="EQUALS">${$t('property.interactivity.variable.EQUALS')}</option>
                                <option value="NOT_EQUALS">${$t('property.interactivity.variable.NOT_EQUALS')}</option>
                            </select>
                        </div>
                    </div>`;
        element.innerHTML += `
                    <div class="field field--sub">
                        <span class="label">${$t('property.interactivity.variable.value')}</span>
                        <div class="value">
                            <input type="text" data-property="ifVariableValue">
                        </div>
                    </div>`;

        return element;
    }

    private renderInteractivityCondition(interactivity: BlockInteractivity): HTMLElement {
        const element = document.createElement("div");

        element.innerHTML += `
                    <div class="field">
                        <span class="label">${$t("property.interactivity.condition.label")}</span>
                        <div class="value">
                            <select data-property="condition">
                                <option value="ALWAYS">${$t("property.interactivity.condition.ALWAYS")}</option>
                                <option value="TIME_PASSED">${$t("property.interactivity.condition.TIME_PASSED")}</option>
                                <option value="VARIABLE">${$t("property.interactivity.condition.VARIABLE")}</option>
                            </select>
                        </div>
                    </div>`;

        if (interactivity.condition == 'TIME_PASSED') {
            element.appendChild(this.renderInteractivityConditionTimer(interactivity));
        }
        if (interactivity.condition == 'VARIABLE') {
            element.appendChild(this.renderInteractivityConditionVariable(interactivity));
        }

        return element;
    }

    private renderFooter(interactivity: BlockInteractivity): HTMLElement {
        const element = document.createElement("div");

        const index = this.blocks[0].interactivity.indexOf(interactivity);

        element.innerHTML += `<div class="footer">
            <button class="move-up ${index == 0 ? 'disabled' : ''}"><span class="mdi mdi-arrow-up"></span></button>
            <button class="move-down ${index == this.blocks[0].interactivity.length - 1 ? 'disabled' : ''}"><span class="mdi mdi-arrow-down"></span></button>

            <button class="delete"><span class="mdi mdi-delete"></span></button>
            <button class="duplicate"><span class="mdi mdi-checkbox-multiple-blank"></span></button>
        </div>`;

        return element;
    }

    private setupPropertiesReactivity(interactivity: BlockInteractivity, element: HTMLElement) {
        for (const field of element.querySelectorAll("[data-property]") as unknown as HTMLElement[]) {
            const actionElement = field.closest(".action") as HTMLElement;
            const id = actionElement?.dataset.id ?? "";
            const action = interactivity.actions.find(a => a.id == id);
            const key = field.getAttribute("data-property") as string;

            const getValue = (): any => {
                if (action) {
                    return action[key as keyof BlockInteractivityAction];
                } else {
                    return interactivity[key as keyof BlockInteractivity];
                }
            }

            const setValue = (value: any) => {
                if (action) {
                    action[key as keyof BlockInteractivityAction] = value;
                } else {
                    // @ts-ignore // I think this is a bug in TypeScript
                    interactivity[key as keyof BlockInteractivity] = value;
                }
            };

            if (field instanceof HTMLInputElement) {
                let value = getValue();

                if (!value) {
                    value = "";
                }

                if (field.type == "checkbox") {
                    field.checked = value;
                } else {
                    field.value = value;
                }
            } else if (field instanceof HTMLSelectElement) {
                if (field.multiple) {
                    for (const option of field.querySelectorAll("option")) {
                        if ((getValue() as string[] ?? []).includes(option.value)) {
                            option.selected = true;
                        }
                    }
                } else {
                    for (const option of field.querySelectorAll("option")) {
                        if (option.value == getValue()) {
                            option.selected = true;
                        }
                    }
                }
            }

            field.addEventListener("change", () => {
                let value: any;
                if (field instanceof HTMLInputElement) {
                    if (field.type == "checkbox") {
                        value = field.checked;
                    } else {
                        value = field.value;
                    }
                } else if (field instanceof HTMLSelectElement) {
                    // If multiple, get all selected values
                    if (field.multiple) {
                        value = [];
                        for (const option of field.options) {
                            if (option.selected) {
                                value.push(option.value);
                            }
                        }
                    } else {
                        value = field.options[field.selectedIndex].value;
                    }
                } else {
                    throw new Error("Unknown field type");
                }

                setValue(value);

                this.render();
            });
        }
    }

    private setupInteractivityEvents(interactivity: BlockInteractivity, element: HTMLElement) {
        const index = this.blocks[0].interactivity.indexOf(interactivity);

        element.querySelector(".delete")?.addEventListener("click", () => {
            this.blocks[0].interactivity = this.blocks[0].interactivity.filter(i => i !== interactivity);
            this.render();
        });
        element.querySelector(".duplicate")?.addEventListener("click", () => {
            this.blocks[0].interactivity.push(JSON.parse(JSON.stringify({
                ...interactivity,
                id: Math.random().toString(36).substring(7)
            })));
            this.render();
        });
        element.querySelector(".move-up")?.addEventListener("click", () => {
            if (index == 0) return;

            this.blocks[0].interactivity = this.blocks[0].interactivity.filter(i => i !== interactivity);
            this.blocks[0].interactivity.splice(index - 1, 0, interactivity);

            this.render();
        });
        element.querySelector(".move-down")?.addEventListener("click", () => {
            if (index == this.blocks[0].interactivity.length - 1) return;

            this.blocks[0].interactivity = this.blocks[0].interactivity.filter(i => i !== interactivity);
            this.blocks[0].interactivity.splice(index + 1, 0, interactivity);

            this.render();
        });
    }

    private setupActionsEvents(interactivity: BlockInteractivity, element: HTMLElement) {
        element.querySelector(".plus-action")?.addEventListener("click", () => {
            interactivity.actions.push({
                id: v4(),
                action: "CHANGE_SLIDE",
                slideType: "NEXT",
                on: "SELF",
                property: "position-x",
                blocks: [],
                slideIndex: 0,
                value: "",
                relative: false,
                animate: false,
                duration: 0,
                easing: "LINEAR",
                changeVariable: "",
                changeVariableValue: "",
            } as any);
            this.render();
        });
        element.querySelectorAll(".delete-action")?.forEach((button) => {
            const actionElement = button.closest(".action") as HTMLElement;
            const id = actionElement.dataset.id;
            const action = interactivity.actions.find(a => a.id == id);

            if (!action) return;

            button.addEventListener("click", () => {
                interactivity.actions = interactivity.actions.filter(a => a !== action);
                this.render();
            });
        });
        element.querySelectorAll(".duplicate-action")?.forEach((button) => {
            const actionElement = button.closest(".action") as HTMLElement;
            const id = actionElement.dataset.id;
            const action = interactivity.actions.find(a => a.id == id);

            if (!action) return;

            button.addEventListener("click", () => {
                interactivity.actions.push(JSON.parse(JSON.stringify({
                    ...action,
                    id: v4()
                })));
                this.render();
            });
        });
    }

    private renderInteractivity(interactivity: BlockInteractivity): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("interactivity");

        element.appendChild(this.renderInteractivityEvent(interactivity));
        element.appendChild(this.renderInteractivityActions(interactivity));
        element.appendChild(this.renderInteractivityCondition(interactivity));
        element.appendChild(this.renderFooter(interactivity));

        this.setupPropertiesReactivity(interactivity, element);
        this.setupInteractivityEvents(interactivity, element);
        this.setupActionsEvents(interactivity, element);

        return element;
    }

}
