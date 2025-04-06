<template>

    <Card fluid class="mb-1">
        <div class="flex flex-justify-center flex-justify-sm-space-between flex-align-center flex-wrap gap-1">
            <span class="main-title" v-t>page.plugins.title</span>

            <div class="flex flex-align-center gap-1">
                <Button v-tooltip="$t('page.plugins.new.tooltip')"
                        color="primary"
                        data-cy="new-material"
                        icon="plus"/>

                <Input v-model:value="search" :label="$t('page.plugins.search')"
                       data-cy="search-materials"
                       :placeholder="$t('page.plugins.search')" dense
                       hide-error hide-label type="text"/>
            </div>
        </div>
    </Card>

    <Card fluid>
        <div class="flex flex-justify-center">
            <Pagination v-model:page="page" :page-size="8" :total="Math.max(Math.ceil(plugins.length/8), 1)"/>
        </div>


        <div v-if="plugins.length === 0" class="mt-1">
            <Alert type="info">
                <span v-t>page.plugins.not-found-by-criteria</span>
            </Alert>
        </div>


        <div class="plugins">
            <article class="plugin" v-for="plugin in pluginsOnPage" :key="plugin.id">
                <div class="meta">
                    <div class="state">
                        <p class="title" v-tooltip="plugin.name">{{ plugin.name }}</p>

                        <div class="description">
                            <p v-t="{lastVersion: plugin.lastRelease().version}">page.plugins.last-version</p>
                        </div>
                    </div>

                    <div class="actions">
                        <Dialog>
                            <template #activator="{toggle}">
                                <Button @click="toggle" color="primary" icon="format-list-text">
                                    <span v-t>page.plugins.list-releases</span>
                                </Button>
                            </template>
                            <template #default>
                                <Card dialog>
                                    <List>
                                        <ListItem v-for="(release, i) in plugin.sortedReleases()" :key="release.version" class="release">
                                            <span class="meta">
                                                <span>{{release.version}}</span>

                                                <span class="active" v-if="i === 0" v-t>page.plugins.active</span>
                                            </span>
                                            <span>
                                                <Dialog>
                                                    <template #activator="{toggle}">
                                                        <Button icon="information-variant" dense @click="toggle"/>
                                                    </template>
                                                    <template #default>
                                                        <Card dialog>
                                                            <Tabs
                                                                v-model:selected="releaseInfo"
                                                                :items="[
                                                                    {
                                                                        value: 'BASE',
                                                                        text: $t('page.plugins.release.info.base'),
                                                                    },
                                                                    {
                                                                        value: 'CHANGELOG',
                                                                        text: $t('page.plugins.release.info.changelog'),
                                                                    },
                                                                    {
                                                                        value: 'EDITOR',
                                                                        text: $t('page.plugins.release.info.editor'),
                                                                    },
                                                                    {
                                                                        value: 'PLAYER',
                                                                        text: $t('page.plugins.release.info.player'),
                                                                    }
                                                                ]"
                                                            ></Tabs>

                                                            <div v-if="releaseInfo == 'BASE'">
                                                                <p><b v-t>page.plugins.release.date</b>: {{ release.date.format("DD. MM. YYYY HH:mm") }}</p>
                                                                <p><b v-t>page.plugins.release.manifest</b>:</p>
                                                                <p class="code">{{ JSON.stringify(JSON.parse(release.manifest), null, 4) }}</p>
                                                            </div>
                                                            <div v-else-if="releaseInfo == 'CHANGELOG'">
                                                                <p class="code"><pre>{{ release.changelog }}</pre></p>
                                                            </div>
                                                            <div v-else-if="releaseInfo == 'EDITOR'">
                                                                <p class="code" v-if="release.editorCode"><pre>{{ release.editorCode }}</pre></p>
                                                                <p v-else v-t>page.plugins.release.info.no-code</p>
                                                            </div>
                                                            <div v-else-if="releaseInfo == 'PLAYER'">
                                                                <p class="code" v-if="release.playerCode"><pre>{{ release.playerCode }}</pre></p>
                                                                <p v-else v-t>page.plugins.release.info.no-code</p>
                                                            </div>
                                                        </Card>
                                                    </template>
                                                </Dialog>
                                            </span>
                                        </ListItem>
                                    </List>

                                    <div class="flex flex-justify-end mt-1">
                                        <Dialog>
                                            <template #activator="{toggle}">
                                                <Button
                                                    @click="toggle"
                                                    color="primary"
                                                >
                                                    <span v-t>page.plugins.new-release.title</span>
                                                </Button>
                                            </template>
                                            <template #default>
                                                <Card dialog>
                                                    <CreatePluginRelease :plugin="plugin" @close="toggle"/>
                                                </Card>
                                            </template>
                                        </Dialog>
                                    </div>
                                </Card>
                            </template>
                        </Dialog>
                        <Dialog>
                            <template #activator="{toggle}">
                                <Button @click="toggle" color="primary" icon="trash-can-outline">
                                    <span v-t>page.plugins.remove</span>
                                </Button>
                            </template>
                        </Dialog>
                    </div>
                </div>
            </article>
        </div>

    </Card>
</template>

<script lang="ts" setup>
import {useUserStore} from "@/stores/user";
import {useRouter} from "vue-router";
import Card from "@/components/design/card/Card.vue";
import {computed, onMounted, ref, watch} from "vue";
import {$t} from "@/translation/Translation";
import FileInput from "@/components/design/input/FileInput.vue";
import Pagination from "@/components/design/pagination/Pagination.vue";
import {usePluginStore} from "@/stores/plugin";
import moment from "moment";
import ListItem from "@/components/design/list/ListItem.vue";
import List from "@/components/design/list/List.vue";
import Tabs from "@/components/design/tabs/Tabs.vue";
import CreatePluginRelease from "@/components/plugin/CreatePluginRelease.vue";

const router = useRouter();

const pluginStore = usePluginStore();

onMounted(() => {
    pluginStore.loadForUser();
})

const search = ref('');
const page = ref(1);

watch(search, () => {
    page.value = 1;
});

const plugins = computed(() => {
    return pluginStore.plugins
        .filter(plugin => {
            return plugin.name.toLowerCase().includes(search.value.toLowerCase()) ||
                plugin.description.toLowerCase().includes(search.value.toLowerCase());
        });
});

const pluginsOnPage = computed(() => {
    return plugins.value.slice((page.value - 1) * 8, page.value * 8);
})

const releaseInfo = ref('BASE');
</script>

<style lang="scss" scoped>
.main-title {
    font-size: 1.75em;
    font-weight: bold;
    line-height: 1.05em;
}

.plugins {
    display: flex;
    flex-direction: column;
    gap: 1em;
    margin-top: 1em;

    > article.plugin {
        //border: 1px solid #ccc;
        background-color: var(--color-background-accent);
        border-radius: var(--border-radius);
        transition: all 0.2s ease;
        color: var(--color-text);
        text-decoration: none;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        position: relative;


        .meta {
            width: 100%;
            justify-content: space-between;
            align-items: center;
            padding: 1em;
            gap: 0.5em;

            display: flex;
            overflow: hidden;

            .state {
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            .title {
                font-size: 1.5em;
                font-weight: bold;
                line-height: 1.05em;

                margin-bottom: 0.4em;


                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .actions {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: end;
            gap: 0.5em;

            :deep(.button) {
                font-size: 0.85em;
                padding: 0.4em 1em;
            }
        }
    }
}

.release {
    .meta {
        display: flex;
        align-items: center;
        gap: 1em;

        .active {
            display: block;
            font-size: 0.8em;
            font-weight: bold;
            background-color: var(--color-primary);
            border-radius: var(--border-radius);
            padding: 0.2em 0.5em;
            color: var(--color-text);
        }
    }
}
.code {
    background-color: var(--color-text);
    color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 1em;
    margin-top: 0.5em;
    font-size: 0.8em;
    font-family: monospace;
    overflow-x: auto;
    max-height: 50vh;
}
</style>
