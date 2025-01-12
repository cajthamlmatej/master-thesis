import {defineStore} from "pinia";
import {ref} from "vue";
import Editor from "@/editor/Editor";
import Slide from "@/models/Slide";
import {generateUUID} from "@/utils/Generators";
import {EditorDeserializer} from "@/editor/EditorDeserializer";
import {EditorSerializer} from "@/editor/EditorSerializer";
import {EditorProperty} from "@/editor/property/EditorProperty";
import html2canvas from "html2canvas";

export const useMaterialStore = defineStore("material", () => {
    const editor = ref<Editor | undefined>(undefined);
    const editorElement = ref<HTMLElement | undefined>(undefined);

    const editorProperty = ref<EditorProperty | undefined>(undefined);
    const editorPropertyElement = ref<HTMLElement | undefined>(undefined);

    const slides = ref<Slide[]>([]);
    const activeSlide = ref<string | undefined>(undefined);

    const requestEditor = () => {
        // TODO: Does user request to load specific material with slides?

        newSlide();
        changeSlide(getSlides()[0]);
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

        editorProperty.value = new EditorProperty(editor.value as Editor, element);
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

    const changeSlide = async (slideOrId: Slide | string) => {
        if (!editorElement.value) return;
        const slide = typeof slideOrId === "string" ? getSlideById(slideOrId) : slideOrId;

        if (!slide) return;

        if (editor.value) {
            // Deserialize the slide content
            const serializer = new EditorSerializer(editor.value as Editor);

            const data = serializer.serialize();

            if (activeSlide) {
                const slide = slides.value.find(slide => slide.id === activeSlide.value);

                if (slide) {
                    slide.content = data;
                    editor.value.getSelector().deselectAllBlocks();

                    const canvas = await html2canvas(editorElement.value.querySelector(".editor-content") as HTMLElement, {
                        // allowTaint: true,
                        logging: false,
                        useCORS: true
                    });
                    slide.thumbnail = canvas.toDataURL();
                }

            }
            editor.value.destroy();
        }

        if (editorProperty.value) {
            editorProperty.value.destroy();
        }

        const deserializer = new EditorDeserializer();
        const newEditor = deserializer.deserialize(slide.content, editorElement.value);

        setEditor(newEditor);
        activeSlide.value = slide.id;

        if (!editorPropertyElement.value) return;

        editorProperty.value = new EditorProperty(newEditor, editorPropertyElement.value);
    }

    const getActiveSlide = () => {
        return getSlideById(activeSlide.value as string);
    }

    const newSlide = () => {
        addSlide(new Slide(
            generateUUID(),
            `{"editor":{"size":{"width":1200,"height":800}},"blocks":[]}`,
            undefined,
            slides.value.length
        ))
    }

    const removeSlide = (slide: Slide) => {
        if(slides.value.length === 1) {
            return;
        }

        const index = slides.value.indexOf(slide);
        slides.value.splice(index, 1);

        if(activeSlide.value === slide.id) {
            changeSlide(slides.value[0]);
        }
    }

    const getSlides = () => {
        return slides.value;
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
        setEditorPropertyElement
    }
});
