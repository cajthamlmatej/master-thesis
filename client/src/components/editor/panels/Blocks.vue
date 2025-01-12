<template>
    <Navigation v-model:menu="slides" shift full-control>
        <template #primary>
            <div class="menu" ref="menu">

            </div>
        </template>
    </Navigation>
</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {useMaterialStore} from "@/stores/material";

const slides = ref(true);

const props = defineProps<{
    value: boolean;
}>();

onMounted(() => {
    slides.value = props.value;
});

const emits = defineEmits(['update:value']);

watch(() => slides.value, (value) => {
    emits('update:value', value);
});

watch(() => props.value, (value) => {
    slides.value = value;
});

const materialStore = useMaterialStore();

</script>

<style scoped lang="scss">

</style>
