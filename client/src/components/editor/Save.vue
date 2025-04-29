<template>
    <NavigationButton :disabled="saving" :label="$t('editor.ui.save')"
                      :tooltip-text="$t('editor.ui.save')"
                      icon="content-save-outline"
                      tooltip-position="bottom"
                      @click="save"></NavigationButton>
</template>

<script lang="ts" setup>
import {useMaterialStore} from "@/stores/material";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {useEditorStore} from "@/stores/editor";
import {$t} from "@/translation/Translation";

const materialStore = useMaterialStore();
const editorStore = useEditorStore();

const saving = ref(false);

const emits = defineEmits(["saving", "save"]);

const save = async () => {
    emits("saving");

    saving.value = true;
    await materialStore.save();
    await (new Promise(resolve => setTimeout(resolve, 1000)));
    saving.value = false;

    emits("save");
}

let saveInterval = null as null | number;

onMounted(() => {
    setupSave();
});

const setupSave = () => {
    // if (saveInterval) {
    //     clearInterval(saveInterval);
    // }

    const editor = editorStore.getEditor();

    if (!editor) {
        return;
    }
    //
    // saveInterval = setInterval(() => {
    //     if (editor.getPreferences().AUTOMATIC_SAVING) {
    //         save();
    //     }
    // }, editor.getPreferences().AUTOMATIC_SAVING_INTERVAL) as unknown as number;
}

watch(() => editorStore.getEditor(), () => {
    const editor = editorStore.getEditor();

    if (!editor) {
        return;
    }

    setupSave();
    editor.events.PREFERENCES_CHANGED.on(setupSave);
});

onUnmounted(() => {
    if (saveInterval) {
        clearInterval(saveInterval);
    }

    const editor = editorStore.getEditor();

    if (!editor) {
        return;
    }

    editor.events.PREFERENCES_CHANGED.off(setupSave);
});
</script>

<style lang="scss" scoped>

</style>
