import {defineStore} from "pinia";
import {computed, ref, toRaw, watch} from "vue";
import Editor from "@/editor/Editor";
import {generateUUID} from "@/utils/Generators";
import {EditorDeserializer} from "@/editor/EditorDeserializer";
import {EditorSerializer} from "@/editor/EditorSerializer";
import {EditorProperty} from "@/editor/property/EditorProperty";
import { toPng } from 'html-to-image';
import {useMaterialStore} from "@/stores/material";
import {Slide} from "@/models/Material";


export const useEditorStore = defineStore("editor", () => {
    const materialStore = useMaterialStore();

    const editor = ref<Editor | undefined>(undefined);
    const editorElement = ref<HTMLElement | undefined>(undefined);

    const editorProperty = ref<EditorProperty | undefined>(undefined);
    const editorPropertyElement = ref<HTMLElement | undefined>(undefined);

    const slides = ref<Slide[]>([] as Slide[]);

    watch(() => materialStore.currentMaterial, (material) => {
        if (!material) return;

        slides.value = material.slides;
    });

    const activeSlide = ref<string | undefined>(undefined);

    const requestEditor = async() => {
        if(!materialStore.currentMaterial) {
            throw new Error("No material loaded, cannot request editor");
        }

        if(!slides.value.length) {
            newSlide();
        }

        await changeSlide(getSlides()[0] as Slide);

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

        if(editorProperty.value) return;

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
        const index = slides.value.indexOf(slide);
        let newIndex = index + direction;

        while(slides.value.find(slide => slide.position === newIndex)) {
            newIndex += direction;
        }

        slide.position = newIndex;
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

                    if(!skipThumbnail) {
                        editor.value.getSelector().deselectAllBlocks();

                        const slideSize = slide.getSize();
                        const ratio = slideSize.width / slideSize.height;

                        let canvasHeight;
                        let canvasWidth;

                        if (ratio > 1) {
                            canvasHeight = Math.min(slideSize.width, 300);
                            canvasWidth = canvasHeight * ratio;
                        } else {
                            canvasWidth = Math.min(slideSize.height, 300);
                            canvasHeight = canvasWidth / ratio;
                        }

                        const element = editorElement.value.querySelector(".editor-content");

                        if (!element) return;

                        slide.thumbnail = await toPng(element as HTMLElement, {
                            backgroundColor: 'white',
                            width: slideSize.width,
                            height: slideSize.height,
                            canvasHeight: canvasHeight,
                            canvasWidth: canvasWidth
                        }).then((dataUrl) => {
                            return dataUrl;
                        });
                    }
                }

            }
        }
    }

    const changeSlide = async (slideOrId: Slide | string) => {
        if (!editorElement.value) return;
        const slide = typeof slideOrId === "string" ? getSlideById(slideOrId) : slideOrId;

        if (!slide) return;

        await saveCurrentSlide();

        if (editor.value) {
            editor.value.destroy();
        }

        if (editorProperty.value) {
            editorProperty.value.destroy();
        }

        const deserializer = new EditorDeserializer();
        const newEditor = deserializer.deserialize(slide.data, editorElement.value);

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
    const newSlide = () => {
        let width = 1200;
        let height = 800;
        const activeSlide = getActiveSlide();

        if(activeSlide) {
            const size = activeSlide.getSize();
            width = size.width;
            height = size.height;
        }

        addSlide(new Slide(
            generateUUID(),
            `{"editor":{"size":{"width":${width},"height":${height}}},"blocks":[]}`,
            undefined,
            slides.value.length
        ))
    }

    const removeSlide = async(slide: Slide) => {
        if(slides.value.length === 1) {
            return;
        }

        const index = slides.value.indexOf(slide);
        slides.value.splice(index, 1);

        if(activeSlide.value === slide.id) {
            await changeSlide(slides.value[0] as Slide);
        }
    }

    const copySlide = async(slide: Slide) => {
        if(activeSlide.value === slide.id) {
            await saveCurrentSlide();
        }

        const newSlide = new Slide(
            generateUUID(),
            slide.data,
            slide.thumbnail,
            slide.position-1
        );

        slides.value.push(newSlide);

        moveSlide(newSlide, 1);
    }

    const getSlides = () => {
        return slides.value.sort((a, b) => a.position - b.position);
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
        getSlides,
        getSlideById,
        requestEditor,
        changeSlide,
        getActiveSlide,
        setEditorProperty,
        getEditorProperty,
        setEditorPropertyElement,
        saveCurrentSlide
    }
});
