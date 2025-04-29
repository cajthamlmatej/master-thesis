<template>
    <p v-t class="title">page.plugins.new-plugin.title</p>

    <Input v-model:value="data.name" :label="$t('page.plugins.new-plugin.name.label')"
           :validators="[
            (value: string) => value.length > 0 || $t('page.plugins.new-plugin.name.error'),
            (value: string) => value.length <= 255 || $t('page.plugins.new-plugin.name.error')
        ]"
    ></Input>

    <div class="flex flex-justify-space-between gap-1 flex-align-center py-1">
        <Select v-model:value="data.icon" :choices="icons" :label="$t('page.plugins.new-plugin.icon.label')"
                class="select"></Select>

        <span :class="{mdi: true, ['mdi-' + data.icon]: true}" class="icon"></span>
    </div>

    <Input v-model:value="data.description" :label="$t('page.plugins.new-plugin.description.label')"
           :validators="[
            (value: string) => value.length > 0 || $t('page.plugins.new-plugin.description.error'),
            (value: string) => value.length <= 255 || $t('page.plugins.new-plugin.description.error')
        ]"></Input>

    <Select v-model:value="data.tags" :choices="tags" :label="$t('page.plugins.new-plugin.tags.label')"
            multiple></Select>

    <div class="flex flex-justify-end mt-2">
        <Button
            :disabled="!canContinue()"
            :loading="creating"
            @click="send"
        >
            <span v-t>page.plugins.new-plugin.submit</span>
        </Button>
    </div>
</template>

<script lang="ts" setup>

import {$t} from "@/translation/Translation";
import {computed, onMounted, reactive, ref} from "vue";
import {usePluginStore} from "@/stores/plugin";
import Select from "@/components/design/select/Select.vue";

const tags = computed(() => {
    return pluginStore.tags.map(t => ({
        name: $t(`editor.plugin.manage.browse.tags.${t}`),
        value: t
    }));
});
const icons = ref([]);

onMounted(() => {
    fetch(`https://raw.githubusercontent.com/Templarian/MaterialDesign/refs/heads/master/meta.json`)
        .then(res => res.json())
        .then(data => {
            icons.value = data.map((icon: any) => ({
                name: icon.name,
                value: icon.name
            }));
        });
})

const data = reactive({
    name: '',
    icon: 'home',
    description: '',
    tags: []
});

const canContinue = () => {
    return data.name.length > 0 && data.description.length > 0 && data.tags.length > 0;
}

const emits = defineEmits(['close'])

const creating = ref(false);
const pluginStore = usePluginStore();
const send = async () => {
    if (creating.value || !canContinue()) {
        return;
    }

    creating.value = true;
    await pluginStore.createPlugin({
        name: data.name,
        icon: data.icon,
        description: data.description,
        tags: data.tags
    });

    creating.value = false;

    emits('close');
}
</script>

<style scoped>
.icon {
    font-size: 2rem;
}

article.select {
    padding-bottom: 0;
    flex-grow: 1;
}
</style>
