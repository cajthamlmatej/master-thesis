import Material from "@/models/Material";

/**
 * Abstract class representing a material importer.
 * Subclasses should implement the `process` method to handle specific import formats.
 */
export abstract class MaterialImporter {
    /**
     * Processes the given content and updates the provided material object.
     * @param content - The content to be processed (e.g., JSON, Markdown).
     * @param material - The material object to be updated with the processed data.
     * @returns A promise that resolves when the processing is complete.
     */
    abstract process(content: string, material: Material): Promise<void>;
}
