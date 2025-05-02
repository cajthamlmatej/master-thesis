import {MaterialImporter} from "@/editor/import/MaterialImporter";
import Material from "@/models/Material";

interface SlideData {
    title: string;
    blocks: {
        type: string;
        html: string;
        items?: number;
    }[]
};

/**
 * Class for importing materials from JSON content.
 * Validates and parses JSON into a presentation format with slides and blocks.
 */
export class JsonMaterialImporter extends MaterialImporter {
    /**
     * Processes the given JSON content and updates the provided material object.
     * @param content - The JSON content to be processed.
     * @param material - The material object to be updated with the processed data.
     * @throws Will throw an error if the JSON format is invalid.
     * @returns A promise that resolves when the processing is complete.
     */
    async process(content: string, material: Material) {
        material.slides = JSON.parse(content);

        if (!material.slides || !Array.isArray(material.slides)) {
            throw new Error("Invalid JSON format");
        }

        // All blocks has to have id and type
        for (let slide of material.slides) {
            if (!slide.id || !slide.data || !slide.data.blocks || !Array.isArray(slide.data.blocks) || !slide.data.editor) {
                throw new Error("Invalid JSON format");
            }

            if (slide.data.editor.size.width <= 0 || slide.data.editor.size.height <= 0) {
                throw new Error("Invalid JSON format");
            }

            for (let block of slide.data.blocks) {
                if (!block.id || !block.type) {
                    throw new Error("Invalid JSON format");
                }
            }
        }
    }
}
