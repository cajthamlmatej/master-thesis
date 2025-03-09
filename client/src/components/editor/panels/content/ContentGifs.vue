<template>
    <div class="flex flex-justify-space-between flex-align-center">
        <Input ref="searchInput" v-model:value="search" :placeholder="$t('editor.panel.content.gifs.search')" hide-error
               hide-label></Input>
        <Button icon="close" @click="search = ''"></Button>
    </div>

    <div v-if="categories.length > 0 && (search.length < 1 || results.length == 0)" class="categories">
        <div v-for="category in categories" :key="category.id" class="category" @click="selectCategory(category)">
            <div class="name">{{ category.name }}</div>
            <div class="image">
                <img :src="category.image" alt="Category Image"/>
            </div>
        </div>
    </div>

    <div v-if="results.length > 0" ref="content" class="results">
        <div v-for="result in results" :key="result.id" class="result"
             @mousedown="(e) => add(e, result.media_formats.gif.url)">
            <img :data-src="result.media_formats.gif.url" draggable="false"
                 src="">
        </div>
    </div>
</template>

<script lang="ts" setup>
import {nextTick, onMounted, ref, toRaw, watch} from "vue";
import {$t, translation} from "@/translation/Translation";
import Input from "@/components/design/input/Input.vue";
import {ImageEditorBlock} from "@/editor/block/base/image/ImageEditorBlock";
import {generateUUID} from "@/utils/Generators";
import Editor from "@/editor/Editor";
import {useEditorStore} from "@/stores/editor";

interface Image {
    id: string;
    media_formats: {
        gif: {
            url: string;
        }
    };
}

interface Category {
    id: string;
    name: string;
    image: string;
    searchterm: string;
}

const API_KEY = 'AIzaSyA5J-eKX0qB5ShmqmDraEkn_Cu9YZdKTPM';

const materialStore = useEditorStore();
const emits = defineEmits(['dismiss']);

const content = ref<HTMLElement | null>(null);
const editor = ref<Editor | null>(null);

const categories = ref([] as Category[]);
const results = ref([] as Image[]);
const search = ref('');

const selectCategory = (category: Category) => {
    search.value = category.searchterm;
}

const searchInput = ref<{
    focus: () => void;
    blur: () => void;
}>({
    focus: () => {
    },
    blur: () => {
    }
});
onMounted(() => {
    loadCategories();

    nextTick(() => {
        searchInput.value.focus();
    });
})

const loadCategories = async () => {
    const url = new URL('https://tenor.googleapis.com/v2/categories');
    url.searchParams.append('key', API_KEY);
    url.searchParams.append('locale', translation.getLanguage());
    url.searchParams.append('type', 'featured');

    const response = await fetch(url.toString());
    const data = await response.json();
    categories.value = data.tags;
}

let debounce: number | null = null;
watch(() => search.value, () => {
    if (debounce) {
        clearTimeout(debounce);
    }

    debounce = setTimeout(() => {
        searchTerm();
    }, 500) as unknown as number;
});

const searchTerm = async () => {
    search.value = search.value.trim();
    results.value = [];
    if (search.value.length < 1) {
        return;
    }

    const url = new URL('https://tenor.googleapis.com/v2/search');
    url.searchParams.append('key', API_KEY);
    url.searchParams.append('locale', translation.getLanguage());
    url.searchParams.append('q', search.value);
    url.searchParams.append('limit', '50');

    const response = await fetch(url.toString());

    const data = await response.json();
    results.value = data.results;

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
        false,
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

<style lang="scss" scoped>
.categories {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    height: calc(100% - 60px);
    overflow-y: auto;

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
