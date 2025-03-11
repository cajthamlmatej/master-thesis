<template>
    <Navigation v-model:menu="visible" full-control shift side="right">
        <template #primary>
            <div ref="menu" class="editor-property">

            </div>
        </template>
    </Navigation>

    <div class="editor-property-hint"
         :class="{
            'editor-property-hint--visible': canBeVisible && !visible && onMobile
         }"
         @click="visible = true">
        <span class="mdi mdi-chevron-right"></span>
    </div>
</template>

<script lang="ts" setup>

import {nextTick, onMounted, ref, watch} from "vue";
import {useEditorStore} from "@/stores/editor";


const onMobile = ref(false);
const visible = ref(false);
const canBeVisible = ref(false);

onMounted(() => {
    onMobile.value = window.innerWidth < 768;

    if (onMobile.value) {
        canBeVisible.value = false;
    } else {
        canBeVisible.value = true;
    }

    window.addEventListener('resize', () => {
        onMobile.value = window.innerWidth < 768;

        if (onMobile.value) {
            visible.value = false;
        }
    });
});


const menu = ref<HTMLElement | null>(null);

watch(() => visible.value, async (value) => {
    if (!visible.value) {
        return;
    }

    if (!menu.value) {
        console.error("Editor property element not found");
        return;
    }

    await nextTick();

    materialStore.setEditorPropertyElement(menu.value);
});

const materialStore = useEditorStore();

watch(() => materialStore.getEditor(), (value) => {
    if (!value) return;

    const editor = value;

    editor.getSelector().events.SELECTED_BLOCK_CHANGED.on((blocks) => {
        // visible.value = blocks.length > 0;
        canBeVisible.value = blocks.length > 0;

        if(onMobile.value && !canBeVisible.value) {
            visible.value = false;
        }

        if(!onMobile.value) {
            visible.value = canBeVisible.value;
        }
    });
});
</script>

<style lang="scss" scoped>

</style>
