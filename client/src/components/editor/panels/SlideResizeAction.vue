<template>
    <Dialog>
        <template #activator="{toggle}">
            <i class="mdi mdi-resize" @click="toggle"/>
        </template>
        <template #default>
            <Card dialog>
                <p class="title">Slide size</p>

                <div class="flex flex-justify-space-between flex-align-center">
                    <Input v-model:value="size.width" label="Width" type="number"
                           :validators="[v => v > 0 || 'Width must be greater than 0']"/>
                    <div class="flex-grow flex flex-justify-center flex-align-center">
                        <span>x</span>
                    </div>
                    <Input v-model:value="size.height" label="Height" type="number"
                           :validators="[v => v > 0 || 'Height must be greater than 0']"/>
                </div>

                <Checkbox
                    v-model:value="resizeToFit"
                    label="Resize content to fit"
                />

                <div class="flex flex-justify-end mt-1">
                    <Button @click="save">Resize</Button>
                </div>
            </Card>
        </template>
    </Dialog>
</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import type {Slide} from "@/models/Material";
import Input from "@/components/design/input/Input.vue";
import Checkbox from "@/components/design/checkbox/Checkbox.vue";
import {useEditorStore} from "@/stores/editor";

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

    if(!editor || !props.slide || size.value.width <= 0 || size.value.height <= 0) {
        return;
    }

    editorStore.changeSlide(props.slide.id);
    editor.resize(size.value.width, size.value.height, resizeToFit.value);

    editorStore.changeSlide(props.slide.id);
};
</script>

<style scoped lang="scss">

</style>
