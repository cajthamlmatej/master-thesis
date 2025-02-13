<template>
    <div class="flex flex-justify-space-between flex-align-center">
        <Input v-model:value="search" hide-label hide-error :placeholder="$t('editor.panel.content.images.search')" ref="searchInput"></Input>
        <Button icon="close" @click="search = ''"></Button>
    </div>

    <div class="results" v-if="results.length > 0" ref="content">
        <div class="result" v-for="result in results" :key="result.id" @mousedown="(e) => add(e, result.src.large2x)">
            <img src="" :data-src="result.src.tiny" loading="lazy" draggable="false">
        </div>
    </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref, toRaw, watch} from "vue";
import {$t, translation} from "@/translation/Translation";
import Input from "@/components/design/input/Input.vue";
import {ImageEditorBlock} from "@/editor/block/image/ImageEditorBlock";
import {generateUUID} from "@/utils/Generators";
import Editor from "@/editor/Editor";
import {useEditorStore} from "@/stores/editor";

interface Image {
    id: string;
    src: {
        tiny: string;
        large2x: string;
    };
}

const API_KEY = '1dq7pXzWrSD9eITvmfYqurPAI4nQslfusEMj0RjeSzCBl5qQhWn0wAXQ';

const emits = defineEmits(['dismiss']);
const materialStore = useEditorStore();

const content = ref<HTMLElement | null>(null);
const editor = ref<Editor | null>(null);

const search = ref('');
const curated = ref([] as Image[]);
const results = ref([] as Image[]);

onMounted(async() => {
    await loadCurated();
    results.value = curated.value;
})

let debounce: number | null = null;
watch(() => search.value, () => {
    if (debounce) {
        clearTimeout(debounce);
    }

    debounce = setTimeout(() => {
        searchTerm();
    }, 500) as unknown as number;
});


const searchInput = ref<{
    focus: () => void;
    blur: () => void;
}>({
    focus: () => {},
    blur: () => {}
});
onMounted(() => {
    nextTick(() => {
        searchInput.value.focus();
    });
})

const loadCurated = async () => {
    const url = new URL('https://api.pexels.com/v1/curated');
    url.searchParams.append('per_page', '40');

    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': API_KEY
        }
    });
    const data = await response.json();
    curated.value = data.photos;
}
const searchTerm = async () => {
    search.value = search.value.trim();

    if(search.value.length < 1) {
        results.value = curated.value;
        return;
    }

    results.value = [];
    if (search.value.length < 1) {
        return;
    }

    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.append('query', search.value);
    url.searchParams.append('per_page', '40');
    url.searchParams.append('locale', translation.getLanguageIdentifier());

    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': API_KEY
        }
    });

    const data = await response.json();
    results.value = data.photos;

    recalculateImages();
};

const recalculateImages = async () => {
    if (!content.value) return;

    const images = content.value.querySelectorAll("img[src='']") as NodeListOf<HTMLImageElement>;
    const contentHeight = content.value.clientHeight;

    for (let image of images) {
        const src = image.getAttribute("data-src");
        if (!src) continue; // Skip if no data-src

        const rect = image.getBoundingClientRect();

        const isVisible = rect.top - rect.height - contentHeight / 4 < contentHeight && rect.top > 0;

        if (isVisible) {
            image.src = src;
        }
    }
};

watch(() => content.value, async () => {
    if (!content.value) return;

    await nextTick();

    recalculateImages();

    content.value!.addEventListener("scroll", () => {
        recalculateImages();
    })
});

watch(() => materialStore.getEditor(), (value) => {
    editor.value = value as Editor;
    console.log(editor.value);
});

onMounted(() => {
    editor.value = materialStore.getEditor() as Editor;
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
        media
    );

    editorValue.addBlock(block);
    block.move(startX, startY);

    const move = (event: MouseEvent) => {
        const {x, y} = editorValue.screenToEditorCoordinates(event.clientX, event.clientY);

        block.move(x, y);

        emits('dismiss');
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
        emits('dismiss');
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
};
</script>

<style scoped lang="scss">
.categories {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;

    > .category {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        height: 90px;

        overflow: hidden;
        position: relative;

        cursor: pointer;

        .name {
            position: relative;
            font-size: 1.5rem;
            font-weight: bold;
            z-index: 2;
            text-align: center;
            color: white;
        }

        .image {
            position: absolute;
            top: 0;
            left: 0;

            width: 100%;
            height: 100%;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            &:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1;

                transition: background 0.3s ease;
            }
        }

        &:hover {
            .image:before {
                background: rgba(0, 0, 0, 0.7);
            }
        }
    }
}

.results {
    height: calc(100% - 60px);
    overflow-y: auto;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    user-select: none;
    grid-auto-rows: min-content;

    > .result {
        position: relative;
        cursor: pointer;
        background-color: black;
        width: 100%;
        aspect-ratio: 1;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            color: transparent;;

            text-indent: -10000px;
            &[src=""] {
                opacity: 0;
            }
        }
    }
}
</style>
