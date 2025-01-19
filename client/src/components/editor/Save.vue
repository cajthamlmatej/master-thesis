<template>
    <NavigationButton hide-mobile icon="content-save-outline"
                      label="Save to cloud"
                      tooltip-position="bottom"
                      tooltip-text="Save to cloud"
    @click="save"></NavigationButton>
</template>

<script setup lang="ts">
import {useMaterialStore} from "@/stores/material";

const materialStore = useMaterialStore();

const save = () => {
    materialStore.save();
}
</script>

<style scoped lang="scss">

</style>
