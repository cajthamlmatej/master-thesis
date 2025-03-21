<template>
    <Dialog>
        <template #activator="{toggle}">
            <i v-tooltip="$t('editor.panel.slides.action.settings')" class="mdi mdi-cogs" @click="toggle"></i>
        </template>
        <template #default>
            <Card dialog>
                <p v-t class="title mb-0">editor.panel.slides.settings.title</p>

                <Tabs fluid :items="[
                    {
                        value: 'visual',
                        text: $t('editor.panel.slides.settings.visual.title'),
                    },
                    {
                        value: 'resize',
                        text: $t('editor.panel.slides.settings.size.title'),
                    }
                ]" v-model:selected="selected"></Tabs>

                <div v-if="selected === 'resize'">
                    <div class="flex flex-justify-space-between flex-align-center">
                        <Input v-model:value="size.width"
                               :label="$t('editor.panel.slides.settings.size.width')"
                               :validators="[v => v > 0 || $t('editor.panel.slides.settings.size.width-invalid')]"
                               type="number"/>
                        <div class="flex-grow flex flex-justify-center flex-align-center">
                            <span v-t>editor.panel.slides.settings.size.times</span>
                        </div>
                        <Input v-model:value="size.height"
                               :label="$t('editor.panel.slides.settings.size.height')"
                               :validators="[v => v > 0 || $t('editor.panel.slides.settings.size.height-invalid')]"
                               type="number"/>
                    </div>

                    <Checkbox
                        v-model:value="resizeToFit"
                        :label="$t('editor.panel.slides.settings.size.to-fit')"
                    />

                    <div class="flex flex-justify-end mt-1">
                        <Button @click="resize"><span v-t>editor.panel.slides.settings.size.resize</span></Button>
                    </div>
                </div>
                <div v-else>
                    <Input v-model:value="settings.color"
                           :label="$t('editor.panel.slides.settings.visual.color')"
                           type="color"
                    />

                    <div class="flex flex-justify-end mt-1">
                        <Button @click="save"><span v-t>editor.panel.slides.settings.visual.save</span></Button>
                    </div>
                </div>
            </Card>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>

import {onMounted, ref, watch} from "vue";
import type {Slide} from "@/models/Material";
import Input from "@/components/design/input/Input.vue";
import Checkbox from "@/components/design/checkbox/Checkbox.vue";
import {useEditorStore} from "@/stores/editor";
import {$t} from "@/translation/Translation";
import Card from "@/components/design/card/Card.vue";
import Tabs from "@/components/design/tabs/Tabs.vue";

const props = defineProps<{
    slide: Slide;
}>();

const editorStore = useEditorStore();
const selected = ref('visual');

watch(() => props.slide, () => {
    const slideSize = props.slide.getSize();
    size.value.width = slideSize.width;
    size.value.height = slideSize.height;
    settings.value.color = props.slide.getColor();
});

const settings = ref({
    color: "#ffffff",
});

const save = () => {
    if (!props.slide) {
        return;
    }
    const editor = editorStore.getEditor();

    if(!editor) {
        return;
    }

    editor.recolor(settings.value.color);
    editorStore.saveCurrentSlide();
    editorStore.synchronizeSlide();
};

const size = ref({
    width: 1920,
    height: 1080
});

const resizeToFit = ref(true);

onMounted(() => {
    const slideSize = props.slide.getSize() ?? {width: 1920, height: 1080};
    size.value.width = slideSize.width;
    size.value.height = slideSize.height;
    settings.value.color = props.slide.getColor() ?? "#ffffff";
});

const resize = () => {
    const editor = editorStore.getEditor();

    if (!editor || !props.slide || size.value.width <= 0 || size.value.height <= 0) {
        return;
    }

    editorStore.changeSlide(props.slide.id);
    editor.resize(size.value.width, size.value.height, resizeToFit.value);

    editorStore.changeSlide(props.slide.id);
    editorStore.saveCurrentSlide();
    editorStore.synchronizeSlide();
};
</script>

<style lang="scss" scoped>

</style>
