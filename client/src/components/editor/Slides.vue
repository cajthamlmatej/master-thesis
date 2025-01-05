<template>
    <Navigation v-model:menu="slides" shift full-control>
        <template #primary>
            <div class="menu" ref="menu">
                <div class="actions">
                    <Button icon="plus" @click="materialStore.newSlide"/>
                    <Button icon="minus" @click="removeActiveSlide" :disabled="canRemoveSlide"/>
                </div>

                <div class="slides">
                    <div class="slide" :class="{'slide--active': slide.id === materialStore.getActiveSlide()?.id}"
                         v-for="(slide, i) in materialStore.getSlides().sort((a, b) => a.position - b.position)"
                         @click="changeSlide(slide.id)">
                        <div class="image" :style="`background-image: url('${slide.thumbnail}')`"></div>

                        <div class="slide-meta">
                            <div class="slide-title">
                                {{ i+1 }}. slide
                            </div>
                            <div class="actions">
                                <i class="mdi mdi-arrow-up" @click="materialStore.moveSlide(slide, -1)" :class="{disabled: i === 0}"/>
                                <i class="mdi mdi-arrow-down" @click="materialStore.moveSlide(slide, 1)" :class="{disabled: i === materialStore.getSlides().length - 1}"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Navigation>
</template>

<script setup lang="ts">

import {computed, onMounted, onUnmounted, ref, watch} from "vue";
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

const canRemoveSlide = computed(() => {
    return materialStore.getSlides().length <= 1;
});

onMounted(() => {
    window.addEventListener("click", handleClick);
    window.addEventListener("mousedown", handleDown);
});

onUnmounted(() => {
    window.removeEventListener("click", handleClick);
    window.removeEventListener("mousedown", handleDown);
});

const removeActiveSlide = () => {
    const active = materialStore.getActiveSlide();
    if (active) {
        materialStore.removeSlide(active);
    }
}
</script>

<style scoped lang="scss">
.menu {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;

    > .actions {
        position: sticky;
        top: 0;
        z-index: 1;
        padding: 0.5rem;
        border-bottom: var(--nagivation-border-width) solid var(--color-navigation-border);
        background-color: var(--color-background);

        display: flex;
        justify-content: center;
        gap: 0.25rem;
        flex-shrink: 0;
    }
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

        > .image {
            width: 100%;
            height: 100%;
            aspect-ratio: 16/9;
            background-color: var(--color-background);

            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;

            &:not([src]) {
                //opacity: 0;
            }
        }

        > .slide-meta {
            color: var(--color-text);
            font-size: 0.75rem;
            padding: 0.25rem 0.25rem 0;

            display: flex;
            justify-content: space-between;
            align-items: center;

            > .actions {
                display: flex;
                gap: 0.25rem;

                .mdi {
                    cursor: pointer;
                    background: var(--color-background-accent);
                    padding: 0.1rem;
                    border-radius: 0.25rem;

                    &:hover {
                        background: var(--color-background);
                    }

                    &.disabled {
                        cursor: not-allowed;
                        background: var(--color-background-accent);

                        &:hover {
                            background: var(--color-background-accent);
                        }
                    }
                }
            }
        }
    }
}
</style>
