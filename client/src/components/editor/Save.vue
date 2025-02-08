<template>
    <NavigationButton hide-mobile icon="content-save-outline"
                      :label="$t('editor.ui.save')"
                      :tooltip-text="$t('editor.ui.save')"
                      tooltip-position="bottom"
                      :disabled="saving"
    @click="save"></NavigationButton>
</template>

<script setup lang="ts">
import {useMaterialStore} from "@/stores/material";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {useEditorStore} from "@/stores/editor";
import {$t} from "@/translation/Translation";

const materialStore = useMaterialStore();
const editorStore = useEditorStore();

const saving = ref(false);

const save = async() => {
    saving.value = true;
    await materialStore.save();
    saving.value = false;
}

let saveInterval = null as null | number;

onMounted(() => {
    setupSave();
});

const setupSave = () => {
    if(saveInterval) {
        clearInterval(saveInterval);
    }

    const editor = editorStore.getEditor();

    if(!editor) {
        return;
    }

    saveInterval = setInterval(() => {
        if(editor.getPreferences().AUTOMATIC_SAVING) {
            save();
        }
    }, editor.getPreferences().AUTOMATIC_SAVING_INTERVAL) as unknown as number;
}

watch(() => editorStore.getEditor(), () => {
    const editor = editorStore.getEditor();

    if(!editor) {
        return;
    }

    setupSave();
    editor.events.PREFERENCES_CHANGED.on(setupSave);
});

onUnmounted(() => {
    if(saveInterval) {
        clearInterval(saveInterval);
    }

    const editor = editorStore.getEditor();

    if(!editor) {
        return;
    }

    editor.events.PREFERENCES_CHANGED.off(setupSave);
});
</script>

<style scoped lang="scss">

</style>
