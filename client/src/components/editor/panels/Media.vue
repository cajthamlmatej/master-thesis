<template>
    <Navigation v-model:menu="contentMenu" full-control shift>
        <template #primary>
            <div v-show="contentMenu" ref="menu" class="menu editor-media">
                <div class="actions">
                    <Dialog v-model:value="addMenu">
                        <template #activator="{ toggle }">
                            <Button fluid icon="plus" @click="toggle">
                                <span v-t>editor.panel.media.add</span>
                            </Button>
                        </template>

                        <template #default>
                            <Card dialog>
                                <p class="title" v-t>editor.panel.media.add</p>

                                <FileInput fluid v-model:value="file"></FileInput>

                                <div class="flex flex-justify-end mt-2">
                                    <Button
                                        icon="plus"
                                        @click="addContent"
                                        :loading="loading"
                                    >
                                        <span v-t>editor.panel.media.add</span>
                                    </Button>
                                </div>
                            </Card>
                        </template>
                    </Dialog>
                </div>


                <div class="content" ref="content">
                    <div v-for="media in mediaStore.media" class="media" @mousedown="(e) => add(e, media.id)" :key="media.id">
                        <img src="" :data-src="mediaStore.linkToMedia(media)" :alt="media.name" loading="lazy" draggable="false"/>
                    </div>
                </div>
            </div>
        </template>
    </Navigation>
</template>

<script lang="ts" setup>

import {nextTick, onMounted, ref, toRaw, watch} from "vue";
import {useEditorStore} from "@/stores/editor";
import Editor from "@/editor/Editor";
import FileInput from "@/components/design/input/FileInput.vue";
import Button from "@/components/design/button/Button.vue";
import {api} from "@/api/api";
import {useMediaStore} from "@/stores/media";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {TextEditorBlock} from "@/editor/block/base/text/TextEditorBlock";
import {generateUUID} from "@/utils/Generators";
import {ShapeEditorBlock} from "@/editor/block/base/shape/ShapeEditorBlock";
import {ImageEditorBlock} from "@/editor/block/base/image/ImageEditorBlock";
import {InteractiveAreaEditorBlock} from "@/editor/block/base/interactiveArea/InteractiveAreaEditorBlock";
import {MermaidEditorBlock} from "@/editor/block/base/mermaid/MermaidEditorBlock";

const contentMenu = ref(true);

const props = defineProps<{
    value: boolean;
}>();

onMounted(() => {
    contentMenu.value = props.value;
});

const emits = defineEmits(['update:value']);

watch(() => contentMenu.value, async(value) => {
    emits('update:value', value);

    await nextTick();

    recalculateImages();
});

watch(() => props.value, (value) => {
    contentMenu.value = value;
});

const mediaStore = useMediaStore();
const materialStore = useEditorStore();
const editor = ref<Editor | null>(null);

watch(() => materialStore.getEditor(), (value) => {
    editor.value = value as Editor;
});

onMounted(async() => {
    await mediaStore.load();


    recalculateImages();
});

const file = ref<File[]>([]);
const addMenu = ref(false);
const loading = ref(false);
const addContent = async() => {
    if(loading.value) return;

    loading.value = true;

    await mediaStore.upload(file.value[0]);

    loading.value = false;
    addMenu.value = false;

    await mediaStore.load();
    await recalculateImages();
};

const recalculateImages = async() => {
    if(!content.value) return;

    const images = content.value.querySelectorAll("img[src='']") as NodeListOf<HTMLImageElement>;
    const contentScroll = content.value.scrollTop;
    const contentHeight = content.value.clientHeight;

    for (let image of images) {
        const src = image.getAttribute("data-src");
        if (!src) continue; // Skip if no data-src

        const rect = image.getBoundingClientRect();

        const isVisible = rect.top - rect.height < contentHeight && rect.top > 0;

        if (isVisible) {
            image.src = src;
        }
    }
};

const content = ref<HTMLElement | null>(null);
const menu = ref<HTMLElement | null>(null);

watch(() => content.value, async () => {
    if(!content.value) return;

    await nextTick();

    recalculateImages();

    content.value!.addEventListener("scroll", () => {
        recalculateImages();
    })
});


const add = (event: MouseEvent, media: string) => {
    const editorValue = toRaw(editor.value);

    if (!editorValue) {
        console.error("Editor not initialized");
        return;
    }

    const {x: startX, y: startY} = editorValue.screenToEditorCoordinates(event.clientX, event.clientY);

    const width = editorValue.getSize().width;
    const height = editorValue.getSize().height;

    const smaller = width < height ? width : height;

    let block = new ImageEditorBlock(
        {
            id: generateUUID(),
            position: {x: -100, y: -100},
            size: {width: smaller / 4, height: smaller / 4},
            rotation: 0,
            zIndex: 0,
        },
        false,
        undefined,
        media
    );

    editorValue.addBlock(block);
    block.move(startX, startY);

    const move = (event: MouseEvent) => {
        const {x, y} = editorValue.screenToEditorCoordinates(event.clientX, event.clientY);

        block.move(x, y);

        contentMenu.value = false;
    };

    const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);

        const diffX = block.position.x - startX;
        const diffY = block.position.y - startY;

        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
            const canvasSize = editorValue.getSize();
            const blockSize = block.size;
            block.move(canvasSize.width / 2 - blockSize.width / 2, canvasSize.height / 2 - blockSize.height / 2);
        }

        editorValue.getSelector().selectBlock(block);
        contentMenu.value = false;
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
};
</script>

<style lang="scss" scoped>

</style>
