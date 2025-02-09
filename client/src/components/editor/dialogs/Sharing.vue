<template>
    <Dialog v-model:value="dialog">
        <template #activator="{toggle}">
            <NavigationButton hide-mobile
                              icon="share-variant-outline"
                              :label="$t('editor.share.open')"
                              :tooltip-text="$t('editor.share.open')"
                              tooltip-position="bottom"
                              @click="toggle"></NavigationButton>
        </template>

        <template #default>
            <Card dialog>
                <p v-t class="title">editor.share.title</p>

                <Input :label="$t('editor.share.name')" v-model:value="data.name"></Input>

                <Select :choices="[
                    {
                        name: $t('editor.share.visibility.PUBLIC'),
                        value: 'PUBLIC'
                    },
                    {
                        name: $t('editor.share.visibility.PRIVATE'),
                        value: 'PRIVATE'
                    }
                ]"
                        :label="$t('editor.share.visibility.label')"
                        v-model:value="data.visibility"
                ></Select>

                <Select
                    :choices="[
                        {
                            name: $t('editor.share.method.AUTOMATIC'),
                            value: 'AUTOMATIC'
                        },
                        {
                            name: $t('editor.share.method.MANUAL'),
                            value: 'MANUAL'
                        },
                        {
                            name: $t('editor.share.method.INTERACTIVITY'),
                            value: 'INTERACTIVITY'
                        }
                    ]"
                    :label="$t('editor.share.method.label')"
                    v-model:value="data.method"
                    :disabled="data.visibility !== 'PUBLIC'"
                />

                <div v-if="data.method === 'AUTOMATIC'">
                    <div class="flex flex-justify-space-between flex-align-center gap-2">
                        <div class="flex-grow">
                            <Input :label="$t('editor.share.automatic.time')" type="number"
                                   :readonly="data.visibility !== 'PUBLIC'"
                                   v-model:value="data.automaticTime"></Input>
                        </div>
                        <span class="mt-0-5" v-t>unit.s</span>
                    </div>
                </div>

                <Select
                    :choices="[
                        {
                            name: $t('editor.share.sizing.FIT_TO_SCREEN'),
                            value: 'FIT_TO_SCREEN'
                        },
                        {
                            name: $t('editor.share.sizing.MOVEMENT'),
                            value: 'MOVEMENT'
                        }
                    ]"
                    :label="$t('editor.share.sizing.label')"
                    v-model:value="data.sizing"
                    :disabled="data.visibility !== 'PUBLIC'"
                />

                <div class="flex flex-justify-end">
                    <Button @click="save" color="primary" :loading="saving">
                        <span v-t>editor.share.save</span>
                    </Button>
                </div>
            </Card>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>

import NavigationButton from "@/components/design/navigation/NavigationButton.vue";
import {onMounted, ref, watch} from "vue";
import {$t} from "@/translation/Translation";
import {useEditorStore} from "@/stores/editor";
import {useMaterialStore} from "@/stores/material";
import Select from "@/components/design/select/Select.vue";
import {MaterialMethod, MaterialSizing, MaterialVisibility} from "../../../../lib/dto/material/MaterialEnums";

const editorStore = useEditorStore();
const materialStore = useMaterialStore();

const dialog = ref(false);

let data = ref({
    name: "",
    visibility: "PUBLIC",
    method: "AUTOMATIC",
    automaticTime: 0,
    sizing: "FIT_TO_SCREEN"
});

const load = () => {
    const material = materialStore.currentMaterial;

    console.log(material);
    if (!material) {
        return;
    }

    data.value.name = material.name;
    data.value.visibility = material.visibility ?? "PUBLIC";
    data.value.method = material.method ?? "MANUAL";
    data.value.automaticTime = material.automaticTime ?? 0;
    data.value.sizing = material.sizing ?? "FIT_TO_SCREEN";
};

onMounted(() => {
    load();
});

watch(() => materialStore.currentMaterial, () => {
    load();
});

const saving = ref(false);
const save = async() => {
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
</script>

<style lang="scss" scoped>
</style>
