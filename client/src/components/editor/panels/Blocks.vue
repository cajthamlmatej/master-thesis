<template>
    <Navigation v-model:menu="blocksMenu" full-control shift>
        <template #primary>
            <div v-show="blocksMenu" class="menu editor-blocks" data-cy="blocks-container">
                <Button
                    v-for="block in blocks"
                    :key="block.type"
                    :icon="block.icon"
                    :data-cy="'blocks-' + block.type + '-button'"
                    @mousedown="(e: MouseEvent) => add(e, block.type)">
                    <span v-t>blocks.{{ block.type }}.name</span>
                </Button>
            </div>
            <div v-show="blocksMenu && pluginBlocks.length > 0" class="menu editor-blocks editor-blocks--plugins">
                <p v-t class="title">editor.plugin.blocks.title</p>

                <Button
                    v-for="block in pluginBlocks"
                    :key="block.id+block.pluginId"
                    v-tooltip="getPluginName(block.pluginId)"
                    :icon="block.icon"
                    :label="getPluginName(block.pluginId)"
                    @mousedown="(e: MouseEvent) => addPlugin(e, block)">
                    <span>{{ block.name }}</span>
                </Button>
            </div>
        </template>
    </Navigation>
</template>

<script lang="ts" setup>

import {computed, onMounted, ref, toRaw, watch} from "vue";
import {useEditorStore} from "@/stores/editor";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {TextEditorBlock} from "@/editor/block/base/text/TextEditorBlock";
import {generateUUID} from "@/utils/Generators";
import {ShapeEditorBlock} from "@/editor/block/base/shape/ShapeEditorBlock";
import {ImageEditorBlock} from "@/editor/block/base/image/ImageEditorBlock";
import Editor from "@/editor/Editor";
import {InteractiveAreaEditorBlock} from "@/editor/block/base/interactiveArea/InteractiveAreaEditorBlock";
import {MermaidEditorBlock} from "@/editor/block/base/mermaid/MermaidEditorBlock";
import {IframeEditorBlock} from "@/editor/block/base/iframe/IframeEditorBlock";
import {ChatEditorBlock} from "@/editor/block/base/chat/ChatEditorBlock";
import {usePluginStore} from "@/stores/plugin";
import {PluginCustomBlock} from "@/editor/plugin/PluginCustomBlock";
import {LatexEditorBlock} from "@/editor/block/base/latex/LatexEditorBlock";

const blocksMenu = ref(true);

const props = defineProps<{
    value: boolean;
}>();

onMounted(() => {
    blocksMenu.value = props.value;
});

const emits = defineEmits(['update:value']);

watch(() => blocksMenu.value, (value) => {
    emits('update:value', value);
});

watch(() => props.value, (value) => {
    blocksMenu.value = value;
    editor.value = toRaw(materialStore.getEditor()) as Editor;
});

const materialStore = useEditorStore();
const editor = ref<Editor | null>(null);

watch(() => materialStore.getEditor(), (value) => {
    editor.value = value as Editor;
});

interface CreateBlockData {
    icon: string;
    type: string;
    create: (x: number, y: number, width: number, height: number, smaller: number) => EditorBlock;
}

const blocks: CreateBlockData[] = [
    {
        icon: "pencil-plus-outline",
        type: "text",
        create: (x, y, width, height, smaller) => {
            const fontSize = smaller / 20;
            const lineHeight = fontSize * 1.5;

            return new TextEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: Math.max(width / 4, 300), height: lineHeight},
                    rotation: 0,
                    zIndex: 0,
                },
                "Your text here",
                fontSize,
            );
        }
    },
    {
        icon: "shape-plus-outline",
        type: "shape",
        create: (x, y, width, height, smaller) => {
            return new ShapeEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                },
                "#1a1a19",
                "arrow-1"
            );
        }
    },
    {
        icon: "image-plus-outline",
        type: "image",
        create: (x, y, width, height, smaller) => {
            return new ImageEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                },
                true,
                "https://robohash.org/" + generateUUID() + "?set=set4"
            );
        }
    },
    {
        icon: "chart-timeline",
        type: "mermaid",
        create: (x, y, width, height, smaller) => {
            return new MermaidEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                },
                "graph TB\na-->b");
        }
    },
    {
        icon: "cursor-default-click-outline",
        type: "interactiveArea",
        create: (x, y, width, height, smaller) => {
            return new InteractiveAreaEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                },
            );
        }
    },
    {
        icon: "application-parentheses-outline",
        type: "iframe",
        create: (x, y, width, height, smaller) => {
            return new IframeEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                },
                "<p><b>Example</b> iframe</p>");
        }
    },
    {
        icon: "chat-processing-outline",
        type: "chat",
        create: (x, y, width, height, smaller) => {
            return new ChatEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                });
        }
    },
    {
        icon: "equal",
        type: "latex",
        create: (x, y, width, height, smaller) => {
            return new LatexEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                }, "e = mc^2");
        }
    }
]

const add = (event: MouseEvent, type: string) => {
    const editorValue = toRaw(editor.value);

    if (!editorValue) {
        console.error("Editor not initialized");
        return;
    }

    const {x: startX, y: startY} = editorValue.screenToEditorCoordinates(event.clientX, event.clientY);

    let block!: EditorBlock;

    const width = editorValue.getSize().width;
    const height = editorValue.getSize().height;

    const smaller = width < height ? width : height;

    const blockData = blocks.find(b => b.type === type);

    if (!blockData) {
        console.error("Block not found");
        return;
    }

    block = blockData.create(startX, startY, width, height, smaller);

    editorValue.addBlock(block);
    block.move(startX, startY);

    const move = (event: MouseEvent) => {
        const {x, y} = editorValue.screenToEditorCoordinates(event.clientX, event.clientY);

        block.move(x, y);

        blocksMenu.value = false;
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
        blocksMenu.value = false;
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
};

const pluginStore = usePluginStore();
const pluginBlocks = computed(() => {
    return pluginStore.manager.getCustomBlocks();
});

const addPlugin = async (event: MouseEvent, blockData: PluginCustomBlock) => {
    const editorValue = toRaw(editor.value);

    if (!editorValue) {
        console.error("Editor not initialized");
        return;
    }

    const {x: startX, y: startY} = editorValue.screenToEditorCoordinates(event.clientX, event.clientY);

    let blockId = await editorValue.getPluginCommunicator().createCustomBlock(blockData.pluginId, blockData.id);

    const block = editorValue.getBlockById(blockId)!;

    editorValue.getSelector().deselectAllBlocks();

    block.move(startX, startY);

    const move = (event: MouseEvent) => {
        const {x, y} = editorValue.screenToEditorCoordinates(event.clientX, event.clientY);

        block.move(x, y);

        blocksMenu.value = false;
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
        blocksMenu.value = false;
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
};

const getPluginName = (pluginId: string) => {
    const plugin = pluginStore.manager.getPlugin(pluginId);
    return plugin ? plugin.getName() : "???";
};
</script>
