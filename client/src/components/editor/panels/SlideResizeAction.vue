<template>
    <Dialog>
        <template #activator="{toggle}">
            <i v-tooltip="$t('editor.panel.slides.action.resize')" class="mdi mdi-resize" @click="toggle"></i>
        </template>
        <template #default>
            <Card dialog>
                <p v-t class="title">editor.panel.slides.size.title</p>

                <div class="flex flex-justify-space-between flex-align-center">
                    <Input v-model:value="size.width"
                           :label="$t('editor.panel.slides.size.width')"
                           :validators="[v => v > 0 || $t('editor.panel.slides.size.width-invalid')]"
                           type="number"/>
                    <div class="flex-grow flex flex-justify-center flex-align-center">
                        <span v-t>editor.panel.slides.size.times</span>
                    </div>
                    <Input v-model:value="size.height"
                           :label="$t('editor.panel.slides.size.height')"
                           :validators="[v => v > 0 || $t('editor.panel.slides.size.height-invalid')]"
                           type="number"/>
                </div>

                <Checkbox
                    v-model:value="resizeToFit"
                    :label="$t('editor.panel.slides.size.to-fit')"
                />

                <div class="flex flex-justify-end mt-1">
                    <Button @click="save"><span v-t>editor.panel.slides.size.resize</span></Button>
                </div>
            </Card>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>

import {onMounted, ref, watch} from "vue";
import type {Slide} from "@/models/Material";
import Input from "@/components/design/input/Input.vue";
import Checkbox from "@/components/design/checkbox/Checkbox.vue";
import {useEditorStore} from "@/stores/editor";
import {$t} from "@/translation/Translation";

const props = defineProps<{
    slide: Slide;
}>();

const size = ref({
    width: 1920,
    height: 1080
});

const resizeToFit = ref(true);

watch(() => props, () => {
    const slideSize = props.slide.getSize();
    size.value.width = slideSize.width;
    size.value.height = slideSize.height;
});

onMounted(() => {
    const slideSize = props.slide.getSize();
    size.value.width = slideSize.width;
    size.value.height = slideSize.height;
});

const editorStore = useEditorStore();
const save = () => {
    const editor = editorStore.getEditor();

    if (!editor || !props.slide || size.value.width <= 0 || size.value.height <= 0) {
        return;
    }

    editorStore.changeSlide(props.slide.id);
    editor.resize(size.value.width, size.value.height, resizeToFit.value);

    editorStore.changeSlide(props.slide.id);
};
</script>

<style lang="scss" scoped>

</style>
