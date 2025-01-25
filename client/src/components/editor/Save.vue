<template>
    <NavigationButton hide-mobile icon="content-save-outline"
                      label="Save to cloud"
                      tooltip-position="bottom"
                      :disabled="saving"
                      tooltip-text="Save to cloud"
    @click="save"></NavigationButton>
</template>

<script setup lang="ts">
import {useMaterialStore} from "@/stores/material";
import {onMounted, onUnmounted, ref} from "vue";
import {useEditorStore} from "@/stores/editor";

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
    saveInterval = setInterval(() => {
        if(editorStore.getEditor() && editorStore.getEditor()?.getPreferences().AUTOMATIC_SAVING) {
            save();
        }
    }, 1000 * 60) as unknown as number;
})

onUnmounted(() => {
    if(saveInterval) {
        clearInterval(saveInterval);
    }
});
</script>

<style scoped lang="scss">

</style>
