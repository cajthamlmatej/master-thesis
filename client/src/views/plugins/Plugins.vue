<template>

    <Card class="mb-1" fluid>
        <div class="flex flex-justify-center flex-justify-sm-space-between flex-align-center flex-wrap gap-1">
            <span v-t class="main-title">page.plugins.title</span>

            <div class="flex flex-align-center gap-1">
                <Dialog>
                    <template #activator="{toggle}">
                        <Button v-tooltip="$t('page.plugins.new.tooltip')"
                                :label="$t('page.plugins.new.tooltip')"
                                color="primary"
                                icon="plus"
                                @click="toggle"/>
                    </template>
                    <template #default="{toggle}">
                        <Card dialog>
                            <CreatePlugin @close="toggle"/>
                        </Card>
                    </template>
                </Dialog>

                <Input v-model:value="search" :label="$t('page.plugins.search')"
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
            <article v-for="plugin in pluginsOnPage" :key="plugin.id" class="plugin">
                <div class="meta">
                    <div class="icon">
                        <span :class="`mdi mdi-` + plugin.icon"></span>
                    </div>

                    <div class="state">
                        <p v-tooltip="plugin.name" class="title">{{ plugin.name }}</p>

                        <div class="description">
                            <p v-t="{lastVersion: plugin.lastRelease()?.version ?? 'N/A'}">page.plugins.last-version</p>
                        </div>
                    </div>

                    <div class="actions">
                        <Dialog>
                            <template #activator="{toggle}">
                                <Button color="primary" icon="format-list-text" @click="toggle">
                                    <span v-t>page.plugins.list-releases</span>
                                </Button>
                            </template>
                            <template #default>
                                <Card dialog>
                                    <List>
                                        <ListItem v-if="plugin.releases.length === 0" class="release">
                                            <span v-t>page.plugins.no-releases</span>
                                        </ListItem>

                                        <ListItem v-for="(release, i) in plugin.sortedReleases()" :key="release.version"
                                                  class="release">
                                            <span class="meta">
                                                <span>{{ release.version }}</span>

                                                <span v-if="i === 0" v-t class="active">page.plugins.active</span>
                                            </span>
                                            <span>
                                                <Dialog>
                                                    <template #activator="{toggle}">
                                                        <Button dense icon="information-variant" @click="toggle"/>
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
                                                                <p><b v-t>page.plugins.release.date</b>: {{
                                                                        release.date.format("DD. MM. YYYY HH:mm")
                                                                    }}</p>
                                                                <p><b v-t>page.plugins.release.manifest</b>:</p>
                                                                <p class="code">{{
                                                                        JSON.stringify(JSON.parse(release.manifest), null, 4)
                                                                    }}</p>
                                                            </div>
                                                            <div v-else-if="releaseInfo == 'CHANGELOG'">
                                                                <pre class="code">{{ release.changelog }}</pre>
                                                            </div>
                                                            <div v-else-if="releaseInfo == 'EDITOR'">
                                                                <pre v-if="release.editorCode" class="code">{{
                                                                        release.editorCode
                                                                    }}</pre>
                                                                <p v-else v-t>page.plugins.release.info.no-code</p>
                                                            </div>
                                                            <div v-else-if="releaseInfo == 'PLAYER'">
                                                                <pre v-if="release.playerCode" class="code">{{
                                                                        release.playerCode
                                                                    }}</pre>
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
                                                    color="primary"
                                                    @click="toggle"
                                                >
                                                    <span v-t>page.plugins.new-release.title</span>
                                                </Button>
                                            </template>
                                            <template #default="{toggle}">
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
                                <Button color="primary" icon="text-box-edit-outline" @click="toggle">
                                    <span v-t>page.plugins.edit</span>
                                </Button>
                            </template>
                            <template #default="{toggle}">
                                <Card dialog>
                                    <EditPlugin :plugin="plugin" @close="toggle"/>
                                </Card>
                            </template>
                        </Dialog>
                        <!--                        <Dialog>-->
                        <!--                            <template #activator="{toggle}">-->
                        <!--                                <Button @click="toggle" color="primary" icon="trash-can-outline">-->
                        <!--                                    <span v-t>page.plugins.remove</span>-->
                        <!--                                </Button>-->
                        <!--                            </template>-->
                        <!--                        </Dialog>-->
                    </div>
                </div>
            </article>
        </div>

    </Card>
</template>

<script lang="ts" setup>
import {useRouter} from "vue-router";
import Card from "@/components/design/card/Card.vue";
import {computed, onMounted, ref, watch} from "vue";
import {$t} from "@/translation/Translation";
import Pagination from "@/components/design/pagination/Pagination.vue";
import {usePluginStore} from "@/stores/plugin";
import ListItem from "@/components/design/list/ListItem.vue";
import List from "@/components/design/list/List.vue";
import Tabs from "@/components/design/tabs/Tabs.vue";
import CreatePluginRelease from "@/components/plugin/CreatePluginRelease.vue";
import CreatePlugin from "@/components/plugin/CreatePlugin.vue";
import EditPlugin from "@/components/plugin/EditPlugin.vue";

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

            .icon {
                flex-shrink: 0;
                width: 1.5em;
                font-size: 3em;
            }

            .state {
                display: flex;
                flex-direction: column;
                justify-content: center;
                flex-grow: 1;
            }

            .title {
                font-size: 1.5em;
                font-weight: bold;
                line-height: 1.05em;

                margin-bottom: 0.4em;


                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;

                max-width: 300px;
            }

            @media (max-width: 768px) {
                flex-direction: column;
                gap: 1em;
                text-align: center;
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

            @media (max-width: 768px) {
                align-items: center;
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
