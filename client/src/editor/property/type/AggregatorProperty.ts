import {Property} from "@/editor/property/Property";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {Type} from "@/utils/TypeScriptTypes";

export abstract class AggregatorProperty<T extends EditorBlock = EditorBlock> extends Property<T> {

    private readonly label: string;
    private readonly properties: Type<Property<T>>[];

    public constructor(label: string, properties: Type<Property<T>>[]) {
        super();
        this.label = label;
        this.properties = properties;
    }

    public override setup(): void {
        this.element.innerHTML = `
            <p class="label">${this.label}</p>
            <div class="property-content property-content--aggregator">
                <div class="property-data property-data--row" data-property="aggregator">

                </div>
            </div>
        `;

        const aggregator = this.element.querySelector<HTMLDivElement>('[data-property="aggregator"]')!;

        for(let clazz of this.properties) {
            const property = new clazz();

            const element = document.createElement("div");
            element.classList.add("property");
            property.initialize(element, this.editorProperty, this.blocks);

            if(!property.isVisible()) {
                continue;
            }
            aggregator.appendChild(element);

            property.setup();
        }
    }

    public override destroy(): void {
        this.element.innerHTML = "";
    }
}
