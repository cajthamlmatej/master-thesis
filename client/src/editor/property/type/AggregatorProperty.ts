import {Property} from "@/editor/property/Property";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {Type} from "@/utils/TypeScriptTypes";
import {sanitizeAttribute} from "@/utils/Sanitize";

/**
 * Represents an aggregator property that groups multiple properties together.
 * Allows for the composition of multiple properties under a single label.
 */
export abstract class AggregatorProperty<T extends EditorBlock = EditorBlock> extends Property<T> {

    private readonly label: string;
    private readonly properties: Type<Property<T>>[];

    /**
     * Initializes the aggregator property with a sanitized label and a list of property classes.
     * @param label - The label for the aggregator property.
     * @param properties - The list of property classes to aggregate.
     */
    public constructor(label: string, properties: Type<Property<T>>[]) {
        super();
        this.label = sanitizeAttribute(label);
        this.properties = properties;
    }

    /**
     * Sets up the DOM structure for the aggregator property and initializes its child properties.
     */
    public override setup(): void {
        this.element.innerHTML = `
            <p class="label">${this.label}</p>
            <div class="property-content property-content--aggregator">
                <div class="property-data property-data--row" data-property="aggregator">

                </div>
            </div>
        `;

        const aggregator = this.element.querySelector<HTMLDivElement>('[data-property="aggregator"]')!;

        for (let clazz of this.properties) {
            const property = new clazz();

            const element = document.createElement("div");
            element.classList.add("property");
            property.initialize(element, this.editorProperty, this.blocks);

            if (!property.isVisible()) {
                continue;
            }
            aggregator.appendChild(element);

            property.setup();
        }
    }

    /**
     * Cleans up the DOM structure when the aggregator property is destroyed.
     */
    public override destroy(): void {
        this.element.innerHTML = "";
    }
}
