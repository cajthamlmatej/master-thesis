import {defineStore} from "pinia";
import {ref} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";
import {api} from "@/api/api";
import type Material from "@/models/Material";
import MaterialMapper from "@/models/mappers/MaterialMapper";
import {useEditorStore} from "@/stores/editor";
import {$t} from "@/translation/Translation";
import {communicator} from "@/api/websockets";
import {generateUUID} from "@/utils/Generators";

export const useMaterialStore = defineStore("material", () => {
    const materials = ref<Material[]>([]);
    const currentMaterial = ref<Material | undefined>(undefined);

    const authenticationStore = useAuthenticationStore();

    const load = async () => {
        const response = await api.material.forUser(authenticationStore.parsed?.id || "");

        if (!response) {
            return;
        }

        // note(Matej): typescript is tweaking out here, the type of material is in fact correct...
        // @ts-ignore
        materials.value = response.materials.map((material) => MaterialMapper.fromMaterialDTO(material));
    }

    let resolve = (val?: any) => {
    };
    const loaded = new Promise((r) => resolve = r);
    const loadMaterial = async (id: string, token: string | undefined = undefined) => {
        const response = await api.material.one(id, token);

        if (!response) {
            resolve();
            throw new Error("Failed to load material");
        }

        const material = MaterialMapper.fromMaterialDTO(response.material);

        // If already exists, replace it
        const existingMaterialIndex = materials.value.findIndex((m) => m.id === material.id);

        if (existingMaterialIndex !== -1) {
            materials.value.splice(existingMaterialIndex, 1, material);
        } else {
            materials.value.push(material);
        }

        if (!material) {
            throw new Error("Material not found");
        }

        currentMaterial.value = material;
        resolve();
    }

    const createMaterial = async () => {
        const response = await api.material.create({
            name: $t("page.dashboard.new-material"),
            plugins: [],
            visibility: "PRIVATE",
            method: "MANUAL",
            automaticTime: 60,
            sizing: "FIT_TO_SCREEN",
            slides: [
                {
                    id: generateUUID(),
                    position: 0,
                    data: {
                        editor: {
                            size: {
                                width: 1920,
                                height: 1080
                            },
                            color: "#ffffff"
                        },
                        blocks: []
                    }
                }
            ]
        });

        if (!response) {
            throw new Error("Failed to create material");
        }

        const material = MaterialMapper.fromMaterialDTO(response.material);
        materials.value.push(material);

        return material;
    }

    const editorStore = useEditorStore();
    const save = async () => {
        if (!currentMaterial.value) {
            throw new Error("No material loaded");
        }

        await editorStore.saveCurrentSlide(true);

        const response = await api.material.update(currentMaterial.value.id, {
            name: currentMaterial.value.name,
            plugins: currentMaterial.value.plugins.map((plugin) => ({
                plugin: plugin.plugin,
                release: plugin.release
            }), []),
            visibility: currentMaterial.value.visibility,
            method: currentMaterial.value.method,
            automaticTime: currentMaterial.value.automaticTime,
            sizing: currentMaterial.value.sizing,
            slides: editorStore.slides.map((slide) => ({
                id: slide.id,
                data: slide.data,
                position: slide.position
            })),
            attendees: currentMaterial.value.serializeAttendees(),
            featured: currentMaterial.value.featured
        });

        if (!response) {
            throw new Error("Failed to save material");
        }
    }

    const updateMaterial = async (material: Material) => {
        const response = await api.material.update(material.id, {
            name: material.name,
            plugins: material.plugins ? material.plugins.map((plugin) => ({
                plugin: plugin.plugin,
                release: plugin.release
            }), []) : undefined,
            visibility: material.visibility,
            method: material.method,
            automaticTime: material.automaticTime,
            sizing: material.sizing,
            slides: material.slides ? material.slides.map((slide) => ({
                id: slide.id,
                data: slide.data,
                position: slide.position
            })) : undefined,
            attendees: material.attendees ? material.serializeAttendees() : undefined,
            featured: material.featured
        });

        if (!response) {
            throw new Error("Failed to save material");
        }
    }

    const updateMaterialFeatured = async (material: Material, featured: boolean) => {
        const response = await api.material.update(material.id, {
            featured: featured
        });

        if (!response) {
            throw new Error("Failed to save material");
        }
    }

    const deleteMaterial = async (id: string) => {
        const response = await api.material.delete(id);

        if (!response) {
            throw new Error("Failed to delete material");
        }

        const materialIndex = materials.value.findIndex((material) => material.id === id);

        if (materialIndex !== -1) {
            materials.value.splice(materialIndex, 1);
        }
    }

    const copyMaterial = async (id: string) => {
        const originalSaved = materials.value.find((material) => material.id === id);

        if (!originalSaved) {
            throw new Error("Material not found");
        }


        const responseMaterial = await api.material.one(id, undefined);
        const original = MaterialMapper.fromMaterialDTO(responseMaterial!.material);

        if(!original) {
            throw new Error("Material not found");
        }

        const response = await api.material.create({
            name: original.name,
            plugins: original.plugins,
            visibility: original.visibility ?? "PRIVATE",
            method: original.method ?? "MANUAL",
            automaticTime: original.automaticTime ?? 0,
            sizing: original.sizing ?? "FIT_TO_SCREEN",
            slides: original.slides.map((slide) => ({
                id: slide.id,
                data: slide.data,
                position: slide.position
            }))
        });

        if (!response) {
            throw new Error("Failed to copy material");
        }

        const material = MaterialMapper.fromMaterialDTO(response.material);
        materials.value.push(material);

        return material;
    }

    const savePreferences = async (preferences: any) => {
        if (!authenticationStore.parsed) {
            throw new Error("No user logged in");
        }

        const response = await api.preferences.update(authenticationStore.parsed.id, preferences);

        if (!response) {
            throw new Error("Failed to save preferences");
        }
    }

    const getPreferences = async () => {
        if (!authenticationStore.parsed) {
            throw new Error("No user logged in");
        }

        const response = await api.preferences.forUser(authenticationStore.parsed.id);

        if (!response) {
            throw new Error("Failed to get preferences");
        }

        return response.preferences;
    }

    const synchronize = () => {
        const material = currentMaterial.value;

        if (!material) {
            return;
        }

        communicator.getEditorRoom()?.synchronizeMaterial({
            plugins: material.plugins.map((p) => ({
                plugin: p.plugin,
                release: p.release,
            })),
            name: material.name,
            method: material.method,
            automaticTime: material.automaticTime,
            sizing: material.sizing,
            visibility: material.visibility,
            // TODO: ATTENDEES
        });
    }

    const featured = ref<{
        id: string;
        user: string;
        thumbnail: string | undefined;
        name: string;
    }[]>([]);
    const loadFeatured = async () => {
        const response = await api.material.featured();

        if (!response) {
            throw new Error("Failed to load featured materials");
        }

        featured.value = response.materials;
    }

    return {
        synchronize,
        materials,
        currentMaterial,
        load,
        loaded,
        loadMaterial,
        createMaterial,
        updateMaterial,
        save,
        deleteMaterial,
        copyMaterial,
        savePreferences,
        getPreferences,

        featured,
        loadFeatured,
        updateMaterialFeatured
    }
});
