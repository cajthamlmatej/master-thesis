<template>
    <Navigation v-model:menu="properties" shift full-control side="right">
        <template #primary>
            <div class="editor-property" ref="menu">

            </div>
        </template>
    </Navigation>
</template>

<script setup lang="ts">

import {nextTick, onMounted, ref, watch} from "vue";
import {useEditorStore} from "@/stores/editor";

const properties = ref(true);

const props = defineProps<{
    value: boolean;
}>();

const menu = ref<HTMLElement | null>(null);

onMounted(() => {
    properties.value = props.value;

    if(!properties.value) {
        return;
    }

    if (!menu.value) {
        console.error("Editor property element not found");
        return;
    }
});

const emits = defineEmits(['update:value']);

watch(() => properties.value, async(value) => {
    emits('update:value', value);

    if(!properties.value) {
        return;
    }

    await nextTick();

    materialStore.setEditorPropertyElement(menu.value);
});

watch(() => props.value, (value) => {
    properties.value = value;
});

const materialStore = useEditorStore();

watch(() => materialStore.getEditor(), (value) => {
    if (!value) return;

    const editor = value;

    editor.getSelector().events.SELECTED_BLOCK_CHANGED.on((blocks) => {
        properties.value = blocks.length > 0;
    });
});
</script>

<style scoped lang="scss">

</style>
