import {MaterialImporter} from "@/editor/import/MaterialImporter";
import Material, {Slide} from "@/models/Material";
import {marked} from "marked";
import {generateUUID} from "@/utils/Generators";

export class JsonMaterialImporter extends MaterialImporter {

    async process(content: string, material: Material) {
        material.slides = JSON.parse(content);
    }

}
