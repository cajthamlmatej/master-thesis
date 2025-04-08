<template>
    <p class="title" v-t>page.plugins.edit-plugin.title</p>

    <Input v-model:value="data.name" :label="$t('page.plugins.edit-plugin.name.label')"
        :validators="[
            (value: string) => value.length > 0 || $t('page.plugins.edit-plugin.name.error'),
        ]"
    ></Input>

    <div class="flex flex-justify-space-between gap-1 flex-align-center py-1">
        <Select  :label="$t('page.plugins.edit-plugin.icon.label')" v-model:value="data.icon" :choices="icons" class="select"></Select>

        <span class="icon" :class="{mdi: true, ['mdi-' + data.icon]: true}"></span>
    </div>

    <Input v-model:value="data.description" :label="$t('page.plugins.edit-plugin.description.label')"
           :validators="[
            (value: string) => value.length > 0 || $t('page.plugins.edit-plugin.description.error'),
        ]"></Input>

    <Select  :label="$t('page.plugins.edit-plugin.tags.label')" v-model:value="data.tags" :choices="tags" multiple></Select>

    <div class="flex flex-justify-end mt-2">
        <Button
            :loading="creating"
            @click="send"
            :disabled="!canContinue()"
        >
            <span v-t>page.plugins.edit-plugin.submit</span>
        </Button>
    </div>
</template>

<script setup lang="ts">

import {$t} from "@/translation/Translation";
import {computed, onMounted, PropType, reactive, ref} from "vue";
import {usePluginStore} from "@/stores/plugin";
import Select from "@/components/design/select/Select.vue";
import Plugin from "@/models/Plugin";

const tags = computed(() => {
    return pluginStore.tags.map(t => ({
        name: $t(`editor.plugin.manage.browse.tags.${t}`),
        value: t
    }));
});
const icons = ref([]);
const props = defineProps({
    plugin: {
        type: Object as PropType<Plugin>,
        required: true,
    },
});

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
    tags: [] as string[],
});

const canContinue = () => {
    return data.name.length > 0 && data.description.length > 0 && data.tags.length > 0;
}

onMounted(() => {
    data.name = props.plugin.name;
    data.icon = props.plugin.icon;
    data.description = props.plugin.description;
    data.tags = props.plugin.tags;
});

const emits = defineEmits(['close'])

const creating = ref(false);
const pluginStore = usePluginStore();
const send = async() => {
    if(creating.value || !canContinue()) {
        return;
    }

    creating.value = true;
    await pluginStore.updatePlugin(props.plugin, {
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
