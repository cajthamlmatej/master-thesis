<template>
    <Navigation v-model:menu="contentMenu" full-control shift>
        <template #primary>
            <div v-show="contentMenu" ref="menu" class="menu editor-content">
                <div class="actions" v-if="currentTab != -1">
                    <Button fluid icon="arrow-left" @click="currentTab = -1">
                        <span v-t>editor.panel.content.back</span>
                    </Button>
                </div>
                <div class="choices" v-else>
                    <div class="choice gifs" @click="currentTab = 0">
                        <p><span v-t>editor.panel.content.gifs.title</span></p>
                    </div>
                    <div class="choice images" @click="currentTab = 1">
                        <p><span v-t>editor.panel.content.images.title</span></p>
                    </div>
<!--                    <div class="choice videos" @click="currentTab = 2">-->
<!--                        <p><span v-t>editor.panel.content.videos</span></p>-->
<!--                    </div>-->
                </div>

                <div class="content" ref="content">
                    <div class="gifs" v-if="currentTab == 0">
                        <ContentGifs @dismiss="contentMenu = false"/>
                    </div>
                    <div class="images" v-else-if="currentTab == 1">
                        <ContentImages @dismiss="contentMenu = false"/>
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
import ContentGifs from "@/components/editor/panels/content/ContentGifs.vue";
import ContentImages from "@/components/editor/panels/content/ContentImages.vue";

const currentTab = ref(-1);

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
    currentTab.value = -1;
});

watch(() => props.value, (value) => {
    contentMenu.value = value;
});

const materialStore = useEditorStore();
const editor = ref<Editor | null>(null);

watch(() => materialStore.getEditor(), (value) => {
    editor.value = value as Editor;
});
</script>

<style lang="scss" scoped>
.content, .gifs, .images {
    height: 100%;
}
</style>
