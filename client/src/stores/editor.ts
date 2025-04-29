import {defineStore} from "pinia";
import {ref, toRaw, watch} from "vue";
import Editor from "@/editor/Editor";
import {generateUUID} from "@/utils/Generators";
import {EditorDeserializer} from "@/editor/EditorDeserializer";
import {EditorSerializer} from "@/editor/EditorSerializer";
import {EditorProperty} from "@/editor/property/EditorProperty";
import {useMaterialStore} from "@/stores/material";
import {Slide} from "@/models/Material";
import {communicator} from "@/api/websockets";


export const useEditorStore = defineStore("editor", () => {
    const materialStore = useMaterialStore();

    const editor = ref<Editor | undefined>(undefined);
    const editorElement = ref<HTMLElement | undefined>(undefined);

    const editorProperty = ref<EditorProperty | undefined>(undefined);
    const editorPropertyElement = ref<HTMLElement | undefined>(undefined);

    const slides = ref<Slide[]>([] as Slide[]);

    watch(() => materialStore.currentMaterial, (material) => {
        if (!material) return;

        synchronizeMaterialSlides();
    });

    const synchronizeMaterialSlides = () => {
        slides.value = (materialStore.currentMaterial?.slides ?? [])
            .sort((a, b) => a.position - b.position);
    }

    const activeSlide = ref<string | undefined>(undefined);

    watch(() => activeSlide.value, (activeSlide) => {
        // materialStore.save();

        if (activeSlide) {
            communicator.getEditorRoom()?.changeSlide(activeSlide);
        }
    })

    const synchronizeSlide = (slide: Slide | undefined = undefined) => {
        const activeSlide = slide ?? getActiveSlide();
        const editor = getEditor();

        if (!activeSlide || !editor) return;

        communicator.getEditorRoom()?.synchronizeSlide({
            slideId: activeSlide.id,
            size: {
                width: activeSlide.getSize().width,
                height: activeSlide.getSize().height
            },
            color: activeSlide.getColor(),
            position: activeSlide.position,
        });
    }

    const requestEditor = async () => {
        if (!materialStore.currentMaterial) {
            throw new Error("No material loaded, cannot request editor");
        }

        if (!slides.value.length) {
            newSlide();
        }

        await changeSlide(slides.value[0] as Slide);

        return getEditor();
    }

    const getEditor = (): Editor | undefined => {
        if (!editor.value) {
            return undefined;
        }

        return editor.value as Editor;
    }

    const setEditor = (editorInstance: Editor) => {
        editor.value = editorInstance;
    }

    const setEditorElement = (element: HTMLElement) => {
        editorElement.value = element;
    }

    const setEditorProperty = (property: EditorProperty) => {
        editorProperty.value = property;
    }
    const setEditorPropertyElement = (element: HTMLElement) => {
        editorPropertyElement.value = element;

        if (editorProperty.value) {
            editorProperty.value.destroy();
        }

        editorProperty.value = new EditorProperty(toRaw(editor.value) as Editor, element);
    }
    const getEditorProperty = (): EditorProperty | undefined => {
        if (!editorProperty.value) {
            return undefined;
        }

        return editorProperty.value as EditorProperty;
    }

    const addSlide = (slide: Slide) => {
        slides.value.push(slide);

        changeSlide(slide);
    }

    const moveSlide = (slide: Slide, direction: -1 | 1) => {
        slide.position += direction;

        const slidePositions = slides.value.map(s => ({
            slide: s,
            position: s.position
        })).sort((a, b) => {
            if (a.position === b.position) {
                if (a.slide.id === slide.id) {
                    return direction;
                }
                if (b.slide.id === slide.id) {
                    return -direction;
                }
                return 0;
            }
            return a.position - b.position;
        });

        for (let slide of slidePositions) {
            let index = slidePositions.indexOf(slide);
            let old = slide.slide.position;

            slide.slide.position = index;
        }

        synchronizeMaterialSlides();

        for (let slide of slides.value) {
            synchronizeSlide(slide);
        }
    }

    const saveCurrentSlide = async (skipThumbnail = false) => {
        if (!editorElement.value) return;

        if (editor.value) {
            // Deserialize the slide content
            const serializer = new EditorSerializer(editor.value as Editor);

            const data = serializer.serialize();

            if (activeSlide) {
                const slide = slides.value.find(slide => slide.id === activeSlide.value);

                if (slide) {
                    slide.data = data;
                }

                if (!skipThumbnail) {
                    if (slide) {
                        // slide.thumbnail = undefined;
                    }
                }
            }
        }
    }


    const changeSlide = async (slideOrId: Slide | string) => {
        if (!editorElement.value) return;
        const slide = typeof slideOrId === "string" ? getSlideById(slideOrId) : slideOrId;

        if (!slide) return;

        await saveCurrentSlide(false);

        if (editor.value) {
            editor.value.destroy();
        }

        if (editorProperty.value) {
            editorProperty.value.destroy();
        }

        const deserializer = new EditorDeserializer();
        const newEditor = await deserializer.deserialize(slide.data, editorElement.value, undefined);

        setEditor(newEditor);
        activeSlide.value = slide.id;

        if (!editorPropertyElement.value) return;

        editorProperty.value = new EditorProperty(newEditor, editorPropertyElement.value);
    }

    const getActiveSlide = () => {
        return getSlideById(activeSlide.value as string);
    }

    /**
     * Create a new slide and add it to the list of slides.
     * The size of the slide will be determined by currently selected slide.
     * If no slide is selected, the default size of 1200x800 will be used.
     */
    const newSlide = async () => {
        await saveCurrentSlide(true);

        let width = 1200;
        let height = 800;
        let color = "#ffffff";
        const activeSlide = getActiveSlide();

        if (activeSlide) {
            const size = activeSlide.getSize();
            width = size.width;
            height = size.height;
            color = activeSlide.getColor();
        }

        const slide = new Slide(
            generateUUID(),
            {
                editor: {
                    size: {
                        width: width,
                        height: height
                    },
                    color: color
                },
                blocks: []
            },
            undefined,
            slides.value.length
        );
        addSlide(slide)
        synchronizeSlide(slide);
    }

    const removeSlide = async (slide: Slide) => {
        if (slides.value.length === 1) {
            return;
        }

        const index = slides.value.indexOf(slide);
        slides.value.splice(index, 1);

        if (activeSlide.value === slide.id) {
            await changeSlide(slides.value[0] as Slide);
        }

        communicator.getEditorRoom()?.removeSlide({slideId: slide.id});
    }

    const copySlide = async (slide: Slide) => {
        if (activeSlide.value === slide.id) {
            await saveCurrentSlide(false);
        }

        const newSlide = new Slide(
            generateUUID(),
            slide.data,
            slide.thumbnail,
            slide.position - 1
        );

        slides.value.push(newSlide);

        moveSlide(newSlide, 1);
    }

    const getSlideById = (id: string) => {
        return slides.value.find(slide => slide.id === id);
    }

    return {
        getEditor,
        setEditorElement,
        setEditor,
        addSlide,
        newSlide,
        moveSlide,
        removeSlide,
        slides,
        getSlideById,
        requestEditor,
        changeSlide,
        getActiveSlide,
        setEditorProperty,
        getEditorProperty,
        setEditorPropertyElement,
        saveCurrentSlide,
        copySlide,
        synchronizeSlide,
        synchronizeMaterialSlides
    }
});
