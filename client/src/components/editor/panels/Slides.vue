<template>
    <Navigation v-model:menu="slides" shift full-control>
        <template #primary>
            <div class="menu editor-slides" ref="menu">
                <div class="actions">
                    <Button icon="plus" fluid @click="materialStore.newSlide">
                        <span v-t>editor.panel.slides.add</span>
                    </Button>
                </div>

                <div class="slides">
                    <div class="slide" :class="{'slide--active': slide.id === materialStore.getActiveSlide()?.id}"
                         v-for="(slide, i) in materialStore.getSlides()"
                         @click="changeSlide(slide.id)">
                        <div class="image-container">
                            <div class="image" :style="`background-image: url('${slide.thumbnail}')`"></div>
                        </div>

                        <div class="slide-meta">
                            <div class="slide-title">
                                {{$t('editor.panel.slides.slide-number', {number: (i+1).toString()})}}
                            </div>
                            <div class="actions">
                                <SlideResizeAction :slide="slide"/>

                                <i class="mdi mdi-arrow-up" v-tooltip="$t('editor.panel.slides.action.up')" @click="materialStore.moveSlide(slide, -1)" :class="{disabled: i === 0}"/>
                                <i class="mdi mdi-arrow-down" v-tooltip="$t('editor.panel.slides.action.down')" @click="materialStore.moveSlide(slide, 1)" :class="{disabled: i === materialStore.getSlides().length - 1}"/>
                                <i class="mdi mdi-content-copy" v-tooltip="$t('editor.panel.slides.action.copy')" @click="copySlide(slide)"/>
                                <i class="mdi mdi-trash-can-outline" v-tooltip="$t('editor.panel.slides.action.delete')" @click="removeSlide(slide)" :class="{disabled: canRemoveSlide}"/>
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
import {useEditorStore} from "@/stores/editor";
import type Material from "@/models/Material";
import {Slide} from "@/models/Material";
import SlideResizeAction from "@/components/editor/panels/SlideResizeAction.vue";
import {$t} from "../../../translation/Translation";

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

const materialStore = useEditorStore();

const changeSlide = (id: string) => {
    if (materialStore.getActiveSlide()?.id === id) return;

    materialStore.changeSlide(id);
}

const canRemoveSlide = computed(() => {
    return materialStore.getSlides().length <= 1;
});
const removeSlide = (slide: Slide) => {
    materialStore.removeSlide(slide);
}
const copySlide = (slide: Slide) => {
    materialStore.copySlide(slide);
}
</script>
