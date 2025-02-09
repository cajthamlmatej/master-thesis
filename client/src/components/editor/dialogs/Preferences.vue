<template>
    <Dialog v-model:value="dialog">
        <template #activator="{toggle}">
            <NavigationButton :label="$t('editor.preferences.open')"
                              :tooltip-text="$t('editor.preferences.open')" hide-mobile
                              icon="cog-outline"
                              tooltip-position="bottom"
                              @click="toggle"></NavigationButton>
        </template>

        <template #default>
            <Card dialog>
                <p v-t class="title">editor.preferences.title</p>

                <List>
                    <ListItem v-for="property in properties" :key="property.key" class="property-holder">
                        <div class="property">
                            <div class="meta">
                                <p v-t class="title">editor.preferences.{{ property.key }}.label</p>
                                <p v-t class="subtitle">editor.preferences.{{ property.key }}.description</p>
                            </div>

                            <div class="value">
                                <template v-if="property.type === 'boolean'">
                                    <Checkbox v-model:value="values[property.key]"
                                              :label="$t('editor.preferences.enabled')"/>
                                </template>
                                <template v-else-if="property.type === 'number'">
                                    <Input v-model:value="values[property.key]" :validators="property.validator"
                                           type="number"/>
                                </template>
                                <template v-else-if="property.type === 'select'">
                                    <Select v-model:value="values[property.key]" :choices="property.options"
                                            :validators="property.validator"/>
                                </template>
                            </div>
                        </div>
                    </ListItem>
                </List>

                <div class="flex flex-justify-end mt-1">
                    <Button @click="save" :loading="saving"><span v-t>editor.preferences.save</span></Button>
                </div>
            </Card>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>

import NavigationButton from "@/components/design/navigation/NavigationButton.vue";
import Editor from "@/editor/Editor";
import {computed, onMounted, ref, watch} from "vue";
import EditorPreferences from "@/editor/EditorPreferences";
import ListItem from "@/components/design/list/ListItem.vue";
import Checkbox from "@/components/design/checkbox/Checkbox.vue";
import {$t} from "@/translation/Translation";
import {useEditorStore} from "@/stores/editor";
import {useMaterialStore} from "@/stores/material";

const editorStore = useEditorStore();
const preferences = computed(() => {
    return editorStore.getEditor()?.getPreferences() ?? {};
});

const properties = [
    {
        key: 'KEEP_EDITOR_TO_FIT_PARENT',
        type: 'boolean',
        validator: [(value: any) => {
            return typeof value === 'boolean';
        }]
    },
    {
        key: 'ROTATION_SNAPPING_COUNT',
        type: 'number',
        validator: [(value: any) => {
            if (!value || value === '') return $t('editor.preferences.validation.required');

            const parsed = parseInt(value);

            if (isNaN(parsed)) return $t('editor.preferences.validation.number');

            return (parsed && parsed >= 2 && parsed <= 180) || $t('editor.preferences.ROTATION_SNAPPING_COUNT.range');
        }]
    },
    {
        key: 'PER_OBJECT_TRANSFORMATION',
        type: 'boolean',
        validator: [(value: any) => {
            return typeof value === 'boolean';
        }]
    },
    {
        key: 'AUTOMATIC_SAVING',
        type: 'boolean',
        validator: [(value: any) => {
            return typeof value === 'boolean';
        }]
    },
    {
        key: 'AUTOMATIC_SAVING_INTERVAL',
        type: 'select',
        options: [
            {
                name: $t('editor.preferences.AUTOMATIC_SAVING_INTERVAL.30-seconds'),
                value: 30 * 1000
            },
            {
                name: $t('editor.preferences.AUTOMATIC_SAVING_INTERVAL.1-minute'),
                value: 60 * 1000
            },
            {
                name: $t('editor.preferences.AUTOMATIC_SAVING_INTERVAL.2-minutes'),
                value: 2 * 60 * 1000
            },
            {
                name: $t('editor.preferences.AUTOMATIC_SAVING_INTERVAL.5-minutes'),
                value: 5 * 60 * 1000
            },
            {
                name: $t('editor.preferences.AUTOMATIC_SAVING_INTERVAL.10-minutes'),
                value: 10 * 60 * 1000
            }
        ]
    },
    {
        key: 'HISTORY_LIMIT',
        type: 'number',
        validator: [(value: any) => {
            if (!value || value === '') return $t('editor.preferences.validation.required');

            const parsed = parseInt(value);

            if (isNaN(parsed)) return $t('editor.preferences.validation.number');

            return (parsed && parsed >= 5 && parsed <= 1000) || $t('editor.preferences.HISTORY_LIMIT.range');
        }]
    }
] as {
    key: keyof EditorPreferences;
    type: 'boolean' | 'number' | 'select';
    options?: { name: string, value: any }[];
    validator: ((value: any) => boolean | 'string')[]
}[];

const values = ref({} as any);

watch(preferences, (value) => {
    const preferences = value as any;

    if (!preferences) return;

    for (const property in preferences) {
        values.value[property] = preferences[property];
    }
}, {immediate: true});

const dialog = ref(false);

const materialStore = useMaterialStore();
const saving = ref(false);
const save = async() => {
    const newPreferences = {} as any;
    saving.value = true;

    for (const key in values.value) {
        let property = properties.find(p => p.key === key);

        if (!property) continue;

        if ((property.validator ?? []).some(v => v(values.value[key]) !== true)) {
            return;
        }

        let value = values.value[key];

        if (properties.find(p => p.key === key)?.type === 'number') {
            value = parseInt(value);
        }

        newPreferences[key] = value;
    }

    editorStore.getEditor()!.setPreferences(newPreferences);

    // Save to server
    await materialStore.savePreferences(editorStore.getEditor()!.getPreferences());

    dialog.value = false;
    saving.value = false;
};

watch(() => editorStore.getEditor(), async(editor) => {
    const preferences = await materialStore.getPreferences();

    if (!preferences) return;

    for (const property in preferences) {
        values.value[property] = preferences[property as keyof EditorPreferences];
    }

    await save();
});
</script>

<style lang="scss" scoped>
.property-holder {
    padding: 0.5em;
}

.property {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1em;

    > div.meta {
        flex-grow: 1;

        > .title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 0.25em
        }

        .subtitle {
            line-height: 1.15em;
            font-size: 0.9em;
            color: var(--color-text-subtle)
        }
    }

    .value {
        width: 30%;
        flex-grow: 0;
        flex-shrink: 0;
    }
}
</style>
