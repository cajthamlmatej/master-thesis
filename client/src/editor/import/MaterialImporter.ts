import Material from "@/models/Material";

export abstract class MaterialImporter {
    abstract process(content: string, material: Material): Promise<void>;
}
