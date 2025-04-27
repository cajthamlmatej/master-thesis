<template>
    <Navigation v-model:menu="slides" full-control shift>
        <template #primary>
            <div ref="menu" class="menu editor-slides">
                <div class="actions">
                    <Button fluid icon="plus" @click="materialStore.newSlide">
                        <span v-t>editor.panel.slides.add</span>
                    </Button>
                </div>

                <div class="slides">
                    <div v-for="(slide, i) in materialStore.slides"
                         :class="{'slide--active': slide.id === materialStore.getActiveSlide()?.id}"
                         class="slide"
                         @click="changeSlide(slide.id)">
                        <div class="image-container">
                            <div :style="`background-image: url('${slide.thumbnail}')`" class="image">
                                <span v-if="!slide.thumbnail" class="mdi mdi-loading mdi-spin"></span>
                            </div>

                            <div class="attendees">
                                <div v-for="attendee in attendees.find(a => a.slide === slide.id)?.attendees"
                                     :key="attendee.id"
                                     :style="{
                                            '--color': attendee.color,
                                        }"
                                     class="attendee"
                                >
                                    <span class="visualiser">
                                        {{ attendee.icon }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="slide-meta">
                            <div class="slide-title">
                                {{ $t('editor.panel.slides.slide-number', {number: (i + 1).toString()}) }}
                            </div>
                            <div class="actions">
                                <SlideSettings :key="slide.getSize().width +'-'+ slide.getSize().height "
                                               :slide="slide"/>

                                <i v-tooltip="$t('editor.panel.slides.action.up')" :class="{disabled: i === 0}"
                                   class="mdi mdi-arrow-up" @click="materialStore.moveSlide(slide, -1)"/>
                                <i v-tooltip="$t('editor.panel.slides.action.down')"
                                   :class="{disabled: i === materialStore.slides.length - 1}"
                                   class="mdi mdi-arrow-down"
                                   @click="materialStore.moveSlide(slide, 1)"/>
                                <i v-tooltip="$t('editor.panel.slides.action.copy')" class="mdi mdi-content-copy"
                                   @click="copySlide(slide)"/>
                                <i v-tooltip="$t('editor.panel.slides.action.delete')"
                                   :class="{disabled: canRemoveSlide}"
                                   class="mdi mdi-trash-can-outline" @click="removeSlide(slide)"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Navigation>
</template>

<script lang="ts" setup>

import {computed, onMounted, ref, watch} from "vue";
import {useEditorStore} from "@/stores/editor";
import {Slide} from "@/models/Material";
import SlideSettings from "@/components/editor/panels/SlideSettings.vue";
import {$t} from "../../../translation/Translation";
import {communicator} from "@/api/websockets";
import {EditorCommunicator} from "@/api/editorCommunicator";
import {EditorAttendee} from "@/api/editorAttendee";

const slides = ref(true);

let editorRoom: EditorCommunicator;

const attendees = ref<{
    slide: string,
    attendees: EditorAttendee[]
}[]>([]);
onMounted(async () => {
    editorRoom = communicator.getEditorRoom()!;
    updateAttendees();
    editorRoom.EVENTS.ATTENDEE_SLIDES_CHANGED.on(() => {
        updateAttendees();
    });
    editorRoom.EVENTS.ATTENDEE_CHANGES.on(() => {
        updateAttendees();
    });
});

function updateAttendees() {
    const current = editorRoom.getCurrent();
    const attendeesCurrent = editorRoom.getAttendees();

    attendees.value = [];

    for (const slide of materialStore.slides) {
        attendees.value.push({
            slide: slide.id,
            attendees: attendeesCurrent.filter(a => a.slideId === slide.id).filter(a => a !== current)
        });
    }
}

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
    return materialStore.slides.length <= 1;
});
const removeSlide = (slide: Slide) => {
    materialStore.removeSlide(slide);
}
const copySlide = (slide: Slide) => {
    materialStore.copySlide(slide);
}
</script>
