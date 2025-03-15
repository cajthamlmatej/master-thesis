<template>
    <div class="editor-plugin-browse-dialog">
        <header>
            <div>
                <Tabs
                    v-model:selected="currentTag"
                    :items="
                    ['ALL', ...pluginStore.tags]
                        .map((tag) => ({ value: tag, text: $t(`editor.plugin.manage.browse.tags.${tag}`) }))
                "
                    fluid
                />
            </div>

            <div class="mb-1">
                <Input
                    v-model:value="search"
                    :placeholder="$t('editor.plugin.manage.browse.search')"
                    hide-error
                    hide-label
                    icon="magnify"
                ></Input>
            </div>
        </header>

        <Pagination v-model:page="page" :page-size="3" class="mb-1" :total="pageCount"/>

        <div class="browse">
            <PluginCard v-for="plugin in pluginsToShow"
                        :key="plugin.id"
                        :active="plugin.active"
                        :plugin="plugin"
                        include-actions

                        @activate="updateKey++"
            />
        </div>

        <p v-if="pluginsToShow.length === 0" class="no-results">{{ $t('editor.plugin.manage.browse.no-plugins') }}</p>
    </div>
</template>

<script lang="ts" setup>

import {$t} from "@/translation/Translation";
import PluginCard from "@/components/plugin/manage/PluginCard.vue";
import Pagination from "@/components/design/pagination/Pagination.vue";
import {computed, onMounted, ref, watch} from "vue";
import {usePluginStore} from "@/stores/plugin";
import Plugin from "@/models/Plugin";

const page = ref(1);
const search = ref('');

const pageCount = computed(() => Math.ceil(plugins.value.length / 3));
const currentTag = ref('ALL');

const updateKey = ref(0);

const pluginsToShow = ref<(Plugin & { active: boolean })[]>([]);

onMounted(() => {
    recalculate();
})

watch([currentTag, search, page, updateKey], () => {
    recalculate();
});

const recalculate = () => {
    pluginsToShow.value = plugins.value.filter((plugin) => {
        return currentTag.value === 'ALL' || plugin.tags.includes(currentTag.value);
    })
        .filter((plugin) => {
            if (search.value.trim() === '') {
                return true;
            }
            return plugin.name.toLowerCase().includes(search.value.toLowerCase());
        })
        .slice((page.value - 1) * 6, page.value * 6)
        .map((plugin) => {
            return {
                ...plugin,
                active: pluginStore.manager.isActive(plugin.id),
                requiresUserAttention: plugin.requiresUserAttention,
            };
        });
};

const pluginStore = usePluginStore();
onMounted(() => {
    pluginStore.load();
});

const plugins = computed(() => pluginStore.plugins);
</script>

<style lang="scss" scoped>
</style>
