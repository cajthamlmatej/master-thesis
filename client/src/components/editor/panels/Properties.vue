<template>
    <Navigation v-model:menu="visible" full-control shift side="right">
        <template #primary>
            <div ref="menu" class="editor-property" data-cy="editor-property">
            </div>
            <div ref="resizer" class="editor-property-resizer" @mousedown.stop.prevent="resize"></div>
            <!--            <div class="editor-property-hider"-->
            <!--                 @click="visible = false">-->
            <!--                <span class="mdi mdi-chevron-right"></span>-->
            <!--            </div>-->
        </template>
    </Navigation>

    <div :class="{
            'editor-property-hint--visible': canBeVisible && !visible
         }"
         class="editor-property-hint"
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
    }

    window.addEventListener('resize', () => {
        onMobile.value = window.innerWidth < 768;

        if (onMobile.value) {
            visible.value = false;
        }
    });
});

const resize = (e: MouseEvent) => {
    const start = e.clientX;
    const parent = (e.target! as HTMLDivElement).closest(".navigation") as HTMLElement;

    if (!parent) {
        return;
    }

    const width = parent.clientWidth;

    const onMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - start;
        const targetWidth = width - diff;

        const halfDisplay = window.innerWidth / 2;

        if (targetWidth < 150) {
            parent.style.width = `${160}px`;

            visible.value = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            return;
        }

        if (targetWidth > halfDisplay) {
            return;
        }

        parent.style.width = `${targetWidth}px`;

        e.preventDefault();
        e.stopPropagation();
    };

    const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
};


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

const firstTime = ref(true);
watch(() => materialStore.getEditor(), (value) => {
    if (!value) return;

    const editor = value;

    let debounce = undefined as undefined | number;
    editor.getSelector().events.SELECTED_BLOCK_CHANGED.on((blocks) => {
        if (debounce) {
            clearTimeout(debounce);
        }

        debounce = setTimeout(() => {
            canBeVisible.value = blocks.length > 0;

            if (canBeVisible.value && firstTime.value && !onMobile.value) {
                visible.value = true;
                firstTime.value = false;
                return;
            }

            if (onMobile.value && !canBeVisible.value) {
                visible.value = false;
            }

            if (!canBeVisible.value) {
                visible.value = false;
            }
        }, 100) as any;
    });
});
</script>
