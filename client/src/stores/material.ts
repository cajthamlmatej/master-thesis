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

    const authenticationStore = useAuthenticationStore();

    const load = async () => {
        const response = await api.material.forUser(authenticationStore.parsed?.id || "");

        if(!response) {
            return;
        }

        materials.value = response.materials.map((material) => MaterialMapper.fromMaterialDTO(material));
    }

    const loadMaterial = async (id: string) => {
        let material = materials.value.find((material) => material.id === id);

        if(!material) {
            const response = await api.material.one(id);

            if(!response) {
                throw new Error("Failed to load material");
            }

            material = MaterialMapper.fromMaterialDTO(response.material);
            materials.value.push(material);
        }

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

        const material = MaterialMapper.fromMaterialDTO(response.material);
        materials.value.push(material);

        return material;
    }

    const editorStore = useEditorStore();
    const save = async () => {
        if(!currentMaterial.value) {
            throw new Error("No material loaded");
        }

        await editorStore.saveCurrentSlide(true);

        const response = await api.material.update(currentMaterial.value.id, {
            name: currentMaterial.value.name,
            slides: editorStore.getSlides()
        });

        if(!response) {
            throw new Error("Failed to save material");
        }
    }

    const deleteMaterial = async (id: string) => {
        const response = await api.material.delete(id);

        if(!response) {
            throw new Error("Failed to delete material");
        }

        const materialIndex = materials.value.findIndex((material) => material.id === id);

        if(materialIndex !== -1) {
            materials.value.splice(materialIndex, 1);
        }
    }

    const copyMaterial = async (id: string) => {
        const original = materials.value.find((material) => material.id === id);

        if(!original) {
            throw new Error("Material not found");
        }

        const response = await api.material.create({
            name: original.name,
            slides: original.slides.map((slide) => ({
                id: slide.id,
                data: slide.data,
                thumbnail: slide.thumbnail,
                position: slide.position
            }))
        });

        if(!response) {
            throw new Error("Failed to copy material");
        }

        const material = MaterialMapper.fromMaterialDTO(response.material);
        materials.value.push(material);

        return material;
    }

    return {
        materials,
        currentMaterial,
        load,
        loadMaterial,
        createMaterial,
        save,
        deleteMaterial,
        copyMaterial
    }
});
