import {MaterialImporter} from "@/editor/import/MaterialImporter";
import Material, {Slide} from "@/models/Material";
import {marked} from "marked";
import {generateUUID} from "@/utils/Generators";

export class JsonMaterialImporter extends MaterialImporter {

    async process(content: string, material: Material) {
        material.slides = JSON.parse(content);

        if(!material.slides || !Array.isArray(material.slides)) {
            throw new Error("Invalid JSON format");
        }

        // All blocks has to have id and type
        for(let slide of material.slides) {
            if(!slide.id || !slide.data || !slide.data.blocks || !Array.isArray(slide.data.blocks) || !slide.data.editor) {
                throw new Error("Invalid JSON format");
            }

            if(slide.data.editor.size.width <= 0 || slide.data.editor.size.height <= 0) {
                throw new Error("Invalid JSON format");
            }

            for(let block of slide.data.blocks) {
                if(!block.id || !block.type) {
                    throw new Error("Invalid JSON format");
                }
            }
        }
    }

}
