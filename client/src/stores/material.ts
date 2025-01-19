import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";
import type User from "@/models/User";
import {api} from "@/api/api";
import UserMapper from "@/models/mappers/UserMapper";
import type Material from "@/models/Material";
import MaterialMapper from "@/models/mappers/MaterialMapper";
import {useEditorStore} from "@/stores/editor";

export const useMaterialStore = defineStore("material", () => {
    const materials = ref<Material[]>([]);
    const currentMaterial = ref<Material | undefined>(undefined);

    const load = async () => {
        const response = await api.material.all();

        if(!response) {
            return;
        }

        materials.value = response.entities.map((material) => MaterialMapper.fromMaterialDTO(material));
    }

    const loadMaterial = async (id: string) => {
        const material = materials.value.find((material) => material.id === id);

        if(!material) {
            throw new Error("Material not found");
        }

        currentMaterial.value = material;
    }

    const createMaterial = async () => {
        const response = await api.material.create({
            name: "New material",
            slides: []
        });

        if(!response) {
            throw new Error("Failed to create material");
        }

        const material = MaterialMapper.fromMaterialDTO(response.entity);
        materials.value.push(material);

        return material;
    }

    const editorStore = useEditorStore();
    const save = async () => {
        if(!currentMaterial.value) {
            throw new Error("No material loaded");
        }

        await editorStore.saveCurrentSlide();

        const response = await api.material.update(currentMaterial.value.id, {
            name: currentMaterial.value.name,
            slides: editorStore.getSlides()
        });

        if(!response) {
            throw new Error("Failed to save material");
        }
    }

    return {
        materials,
        currentMaterial,
        load,
        loadMaterial,
        createMaterial,
        save
    }
});
