<template>
    <Navigation v-model:menu="slides" shift full-control>
        <template #primary>
            <div class="menu" ref="menu">
                <div class="actions">
                    <Button icon="mdi-plus" @click="materialStore.newSlide">Add Slide</Button>
                </div>

                <div class="slides">
                    <div class="slide" :class="{'slide--active': slide.id === materialStore.getActiveSlide()?.id}"
                         v-for="slide in materialStore.getSlides()"
                         @click="changeSlide(slide.id)">
                        <img class="image" :src="slide.thumbnail ? slide.thumbnail: undefined" alt="Slide Image">

                        <div class="slide-meta">
                            {{ slide.position+1 }}. slide
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Navigation>
</template>

<script setup lang="ts">

import {onMounted, onUnmounted, ref, watch} from "vue";
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
    console.log(value);
    slides.value = value;
});

const materialStore = useMaterialStore();

const changeSlide = (id: string) => {
    if (materialStore.getActiveSlide()?.id === id) return;

    materialStore.changeSlide(id);
}

const menu = ref<HTMLElement | null>(null);
const handleClick = (event: MouseEvent) => {
    if (event.target instanceof HTMLElement) {
        if(!event.target.closest(".editor-view")) return;

        slides.value = false;
    }
}
const handleDown = (event: MouseEvent) => {
    if(event.target instanceof HTMLElement) {
        if(!event.target.closest(".editor-view")) return;

        slides.value = false;
    }
}

onMounted(() => {
    window.addEventListener("click", handleClick);
    window.addEventListener("mousedown", handleDown);
});

onUnmounted(() => {
    window.removeEventListener("click", handleClick);
    window.removeEventListener("mousedown", handleDown);
});
</script>

<style scoped lang="scss">
.menu {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.actions {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 0.5rem;
    border-bottom: var(--nagivation-border-width) solid var(--color-navigation-border);
    background-color: var(--color-background);

    display: flex;
    justify-content: center;
    flex-shrink: 0;
}

.slides {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
    padding: 0.5rem;
    overflow-y: auto;
    flex-grow: 1;

    .slide {
        padding: 0.25em;
        border-radius: 0.5rem;
        cursor: pointer;
        background-color: var(--color-background-accent);
        color: var(--color-text);

        width: 100%;

        &.slide--active {
            outline: 2px solid var(--color-primary);
        }

        > img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            aspect-ratio: 16/9;

            &:not([src]) {
                opacity: 0;
            }
        }

        > .slide-meta {
            color: var(--color-text);
            font-size: 0.75rem;
            padding: 0 0.25rem;
        }
    }
}
</style>
