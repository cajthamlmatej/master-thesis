<template>
    <Dialog v-model:value="dialog">
        <template #activator="{toggle}">
            <NavigationButton
                :label="$t('editor.sharing.open')"
                :tooltip-text="$t('editor.sharing.open')"
                icon="share-variant-outline"
                tooltip-position="bottom"
                @click="toggle"></NavigationButton>
        </template>

        <template #default>
            <Card dialog>
                <p v-t class="title">editor.sharing.title</p>

                <List>
                    <Dialog>
                        <template #activator="{toggle}">
                            <ListItem hover @click="toggle">
                                <span v-t>editor.sharing.share.title</span>
                            </ListItem>
                        </template>
                        <template #default>
                            <Card dialog>
                                <div class="flex flex-justify-space-between">
                                    <p v-t class="title">editor.sharing.share.title</p>

                                    <div>
                                        <Dialog>
                                            <template #activator="{toggle}">
                                                <Button
                                                    color="primary"
                                                    icon="link-variant"
                                                    @click="toggle"
                                                >
                                                    <span v-t>editor.sharing.share.link</span>
                                                </Button>
                                            </template>
                                            <template #default>
                                                <Card dialog>
                                                    <div
                                                        class="flex flex-justify-space-between flex-align-center gap-2">
                                                        <div class="flex-grow">
                                                            <Input v-model:value="link" :readonly="true" hide-error
                                                                   hide-label></Input>
                                                        </div>

                                                        <div>
                                                            <Button
                                                                color="primary"
                                                                icon="content-copy"
                                                                @click="copyLink"
                                                            ></Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </template>
                                        </Dialog>
                                    </div>
                                </div>

                                <Input v-model:value="data.name" :label="$t('editor.sharing.share.name')"></Input>

                                <Select v-model:value="data.visibility"
                                        :choices="[
                                    {
                                        name: $t('editor.sharing.share.visibility.PUBLIC'),
                                        value: 'PUBLIC'
                                    },
                                    {
                                        name: $t('editor.sharing.share.visibility.PRIVATE'),
                                        value: 'PRIVATE'
                                    }
                                ]"
                                        :label="$t('editor.sharing.share.visibility.label')"
                                ></Select>

                                <Select
                                    v-model:value="data.method"
                                    :choices="[
                                        {
                                            name: $t('editor.sharing.share.method.AUTOMATIC'),
                                            value: 'AUTOMATIC'
                                        },
                                        {
                                            name: $t('editor.sharing.share.method.MANUAL'),
                                            value: 'MANUAL'
                                        },
                                        {
                                            name: $t('editor.sharing.share.method.INTERACTIVITY'),
                                            value: 'INTERACTIVITY'
                                        }
                                    ]"
                                    :label="$t('editor.sharing.share.method.label')"
                                />

                                <div v-if="data.method === 'AUTOMATIC'">
                                    <div class="flex flex-justify-space-between flex-align-center gap-2">
                                        <div class="flex-grow">
                                            <Input v-model:value="data.automaticTime"
                                                   :label="$t('editor.sharing.share.automatic.time')"
                                                   :readonly="data.visibility !== 'PUBLIC'"
                                                   type="number"></Input>
                                        </div>
                                        <span v-t class="mt-0-5">unit.s</span>
                                    </div>
                                </div>

                                <Select
                                    v-model:value="data.sizing"
                                    :choices="[
                                        {
                                            name: $t('editor.sharing.share.sizing.FIT_TO_SCREEN'),
                                            value: 'FIT_TO_SCREEN'
                                        },
                                        {
                                            name: $t('editor.sharing.share.sizing.MOVEMENT'),
                                            value: 'MOVEMENT'
                                        }
                                    ]"
                                    :label="$t('editor.sharing.share.sizing.label')"
                                />

                                <div class="flex flex-justify-end">
                                    <Button :loading="saving" color="primary" @click="save">
                                        <span v-t>editor.sharing.share.save</span>
                                    </Button>
                                </div>
                            </Card>
                        </template>
                    </Dialog>
                    <Dialog>
                        <template #activator="{toggle}">
                            <ListItem hover @click="toggle">
                                <span v-t>editor.sharing.export.title</span>
                            </ListItem>
                        </template>
                        <template #default>
                            <Card dialog>
                                <p v-t class="title">editor.sharing.export.title</p>

                                <p v-t class="description mb-1">editor.sharing.export.description</p>

                                <List>
                                    <ListItem hover :disabled="exporting" @click="exportFile('local')">
                                        <span v-t>editor.sharing.export.local</span>

                                        <span class="mdi mdi-download-outline"></span>
                                    </ListItem>
                                    <ListItem hover :disabled="exporting" @click="exportFile('pdf')">
                                        <span v-t>editor.sharing.export.pdf</span>

                                        <span class="mdi mdi-download-outline"></span>
                                    </ListItem>
                                </List>



                                <Dialog v-model:value="exporting" persistent>
                                    <template #default>
                                        <Card dialog>
                                            <p v-t class="title">editor.sharing.exporting.title</p>

                                            <p v-t class="description">editor.sharing.exporting.description</p>

                                            <span class="mdi mdi-loading mdi-spin mdi-48px"></span>
                                        </Card>
                                    </template>
                                </Dialog>
                            </Card>
                        </template>
                    </Dialog>
                </List>
            </Card>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>

import NavigationButton from "@/components/design/navigation/NavigationButton.vue";
import {onMounted, ref, watch} from "vue";
import {$t} from "@/translation/Translation";
import {useMaterialStore} from "@/stores/material";
import Select from "@/components/design/select/Select.vue";
import {MaterialMethod, MaterialSizing, MaterialVisibility} from "../../../../lib/dto/material/MaterialEnums";
import router from "@/router";
import ListItem from "@/components/design/list/ListItem.vue";
import Card from "@/components/design/card/Card.vue";
import List from "@/components/design/list/List.vue";
import {api} from "@/api/api";
import fileSaver from "file-saver";

const materialStore = useMaterialStore();

const dialog = ref(false);

let data = ref({
    name: "",
    visibility: "PUBLIC",
    method: "AUTOMATIC",
    automaticTime: 0,
    sizing: "FIT_TO_SCREEN"
});

const link = ref("");

const load = () => {
    const material = materialStore.currentMaterial;

    if (!material) {
        return;
    }

    data.value.name = material.name;
    data.value.visibility = material.visibility ?? "PUBLIC";
    data.value.method = material.method ?? "MANUAL";
    data.value.automaticTime = material.automaticTime ?? 0;
    data.value.sizing = material.sizing ?? "FIT_TO_SCREEN";

    const domain = window.location.origin;
    const player = router.resolve({name: 'Player', params: {material: material.id}}).href;

    link.value = `${domain}${player}`;
};

const copyLink = () => {
    navigator.clipboard.writeText(link.value);
};

onMounted(() => {
    load();
});

watch(() => materialStore.currentMaterial, () => {
    load();
});

const saving = ref(false);
const save = async () => {
    const material = materialStore.currentMaterial;

    if (!material) {
        return;
    }

    saving.value = true;

    material.name = data.value.name;
    material.visibility = data.value.visibility as MaterialVisibility
    material.method = data.value.method as MaterialMethod;
    material.automaticTime = Number(data.value.automaticTime);
    material.sizing = data.value.sizing as MaterialSizing;

    await materialStore.save();

    dialog.value = false;
    saving.value = false;
};

const exporting = ref(false);
const exportFile = async (type: string) => {
    exporting.value = true;
    let suffix = ".bin";

    if(type === "pdf") {
        suffix = "pdf";
    } else if(type === "local") {
        suffix = "json";
    }

    const response = await api.material.export(materialStore.currentMaterial!.id, type);

    if(!response) {
        // TODO: notify
        exporting.value = false;
        return;
    }

    let name = (materialStore.currentMaterial?.name ?? "file") + "." + suffix;

    fileSaver.saveAs(response.blob, name);
    exporting.value = false;
}
</script>

<style lang="scss" scoped>
</style>
