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
                                <span class="mdi mdi-file-settings-outline"></span>
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
                                <span class="mdi mdi-file-export-outline"></span>
                            </ListItem>
                        </template>
                        <template #default>
                            <Card dialog>
                                <p v-t class="title">editor.sharing.export.title</p>

                                <p v-t class="description mb-1">editor.sharing.export.description</p>

                                <List>
                                    <ListItem hover :disabled="exporting" @click="exportFile('json')">
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

                                            <div class="flex flex-justify-center">
                                                <span class="mdi mdi-loading mdi-spin mdi-48px"></span>
                                            </div>
                                        </Card>
                                    </template>
                                </Dialog>
                            </Card>
                        </template>
                    </Dialog>
                    <Dialog>
                        <template #activator="{toggle}">
                            <ListItem hover @click="toggle">
                                <span v-t>editor.sharing.attendees.title</span>
                                <span class="mdi mdi-account-group-outline"></span>
                            </ListItem>
                        </template>
                        <template #default>
                            <Card dialog>
                                <p v-t class="title">editor.sharing.attendees.title</p>

                                <p v-t class="description mb-1">editor.sharing.attendees.description</p>


                                <div class="flex flex-justify-end mb-1">
                                    <Dialog>
                                        <template #activator="{toggle}">
                                            <Button
                                                color="primary"
                                                icon="plus"
                                                class="mt-1"
                                                @click="toggle">
                                                <span v-t>editor.sharing.attendees.add.title</span>
                                            </Button>
                                        </template>
                                        <template #default="{toggle}">
                                            <Card dialog>
                                                <p class="title" v-t>editor.sharing.attendees.add.title</p>

                                                <p class="description mb-1" v-t>editor.sharing.attendees.add.description</p>

                                                <Input
                                                    v-model:value="newAttendee"
                                                    :label="$t('editor.sharing.attendees.add.input')"></Input>

                                                <div class="flex flex-justify-end">
                                                    <Button
                                                        color="primary"
                                                        @click="() => {addToAttendees(); toggle()}"
                                                    >
                                                        <span v-t>editor.sharing.attendees.add.add</span>
                                                    </Button>
                                                </div>
                                            </Card>
                                        </template>
                                    </Dialog>
                                </div>
                                <List>
                                    <ListItem v-for="(attendee, i) in data.attendees" :key="i" hover class="flex-align-center">
                                        <span v-if="typeof attendee === 'object'">
                                            {{attendee.name}}
                                        </span>
                                        <span v-else>
                                            {{attendee}}
                                        </span>

                                        <div>
                                            <Button
                                                icon="delete-outline"
                                                v-tooltip="$t('editor.attendee.remove')"
                                                @click="removeAttendee(attendee)"
                                            />
                                        </div>
                                    </ListItem>

                                    <ListItem v-if="data.attendees.length == 0">
                                        <span v-t>editor.sharing.attendees.empty</span>
                                    </ListItem>
                                </List>

                                <div class="flex flex-justify-end mt-1">
                                    <Button :loading="saving" color="primary" @click="save">
                                        <span v-t>editor.sharing.share.save</span>
                                    </Button>
                                </div>
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
import Button from "@/components/design/button/Button.vue";

const materialStore = useMaterialStore();

const dialog = ref(false);

let data = ref({
    name: "",
    visibility: "PUBLIC",
    method: "AUTOMATIC",
    automaticTime: 0,
    sizing: "FIT_TO_SCREEN",
    attendees: [] as ({
        id: string;
        name: string;
    } | string)[]
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
    data.value.attendees = material.attendees ?? [];

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
    material.attendees = data.value.attendees;

    await materialStore.save();

    dialog.value = false;
    saving.value = false;

    materialStore.synchronize();
};

const exporting = ref(false);
const exportFile = async (type: string) => {
    exporting.value = true;
    let suffix = ".bin";

    if(type === "pdf") {
        suffix = "pdf";
    } else if(type === "json") {
        suffix = "json";
    }

    const response = await api.material.export(materialStore.currentMaterial!.id, type);

    if(!response || response.status !== 200) {
        // TODO: notify
        exporting.value = false;
        return;
    }

    let name = (materialStore.currentMaterial?.name ?? "file") + "." + suffix;

    fileSaver.saveAs(response.blob, name);
    exporting.value = false;
}

const newAttendee = ref("");
const addToAttendees = () => {
    if (!newAttendee.value) {
        return;
    }

    data.value.attendees.push(newAttendee.value);

    newAttendee.value = "";
};

const removeAttendee = (attendee: string | { id: string; name: string }) => {
    const index = data.value.attendees.indexOf(attendee);

    if (index > -1) {
        data.value.attendees.splice(index, 1);
    }
};
</script>

<style lang="scss" scoped>
</style>
