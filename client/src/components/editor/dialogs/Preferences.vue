<template>
    <Dialog v-model:value="dialog">
        <template #activator="{toggle}">
            <NavigationButton @click="toggle"
                              hide-mobile icon="cog-outline"
                              label="Preferences"
                              tooltip-position="bottom"
                              tooltip-text="Preferences"></NavigationButton>
        </template>

        <template #default>
            <Card dialog>
                <p class="title">Preferences</p>

                <List>
                    <ListItem v-for="property in properties" :key="property.key" class="property-holder">
                        <div class="property">
                            <div class="meta">
                                <p class="title">{{ property.label }}</p>
                                <p class="subtitle">{{ property.description }}</p>
                            </div>

                            <div class="value">
                                <template v-if="property.type === 'boolean'">
                                    <Checkbox v-model:value="values[property.key]" label="Enabled"/>
                                </template>
                                <template v-else-if="property.type === 'number'">
                                    <Input v-model:value="values[property.key]" type="number"
                                           :validators="property.validator"/>
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
                    <Button @click="save">Save</Button>
                </div>
            </Card>
        </template>
    </Dialog>
</template>

<script setup lang="ts">

import NavigationButton from "@/components/design/navigation/NavigationButton.vue";
import Editor from "@/editor/Editor";
import {computed, ref, watch} from "vue";
import EditorPreferences from "@/editor/EditorPreferences";
import ListItem from "@/components/design/list/ListItem.vue";
import Checkbox from "@/components/design/checkbox/Checkbox.vue";

const props = defineProps<{
    editor: Editor | undefined
}>();

const preferences = computed(() => {
    return props.editor?.getPreferences();
});

const properties = [
    {
        key: 'KEEP_EDITOR_TO_FIT_PARENT',
        label: 'Keep editor to fit the parent',
        description: 'When enabled, the editor will always fit the parent element while resizing.',
        type: 'boolean',
        validator: [(value: any) => {
            return typeof value === 'boolean';
        }]
    },
    {
        key: 'ROTATION_SNAPPING_COUNT',
        label: 'Rotation snapping count',
        description: 'The count of the snapping while rotating the object (using SHIFT while rotating).',
        type: 'number',
        validator: [(value: any) => {
            if (!value || value === '') return 'The value should be filled';

            const parsed = parseInt(value);

            if (isNaN(parsed)) return 'The value should be a number';

            return (parsed && parsed >= 2 && parsed <= 180) || 'The value should be between 2 and 180';
        }]
    },
    {
        key: 'PER_OBJECT_TRANSFORMATION',
        label: 'Per object transformation',
        description: 'When enabled, the transformation (rotate and scale) will be applied per object instead of the selected objects (group).',
        type: 'boolean',
        validator: [(value: any) => {
            return typeof value === 'boolean';
        }]
    },
    {
        key: 'AUTOMATIC_SAVING',
        label: 'Automatic saving',
        description: 'When enabled, the editor will automatically save the project regularly.',
        type: 'boolean',
        validator: [(value: any) => {
            return typeof value === 'boolean';
        }]
    },
    {
        key: 'AUTOMATIC_SAVING_INTERVAL',
        label: 'Automatic saving interval',
        description: 'The interval of the automatic saving. Is only available when the automatic saving is enabled.',
        type: 'select',
        options: [
            {
                name: '30 seconds',
                value: 30 * 1000
            },
            {
                name: '1 minute',
                value: 60 * 1000
            },
            {
                name: '2 minutes',
                value: 2 * 60 * 1000
            },
            {
                name: '5 minutes',
                value: 5 * 60 * 1000
            },
            {
                name: '10 minutes',
                value: 10 * 60 * 1000
            }
        ]
    },
    {
        key: 'HISTORY_LIMIT',
        label: 'History stack limit',
        description: 'The limit of the history stack. The editor will remove the oldest history if the limit is reached. May affect the performance.',
        type: 'number',
        validator: [(value: any) => {
            if (!value || value === '') return 'The value should be filled';

            const parsed = parseInt(value);

            if (isNaN(parsed)) return 'The value should be a number';

            return (parsed && parsed >= 5 && parsed <= 1000) || 'The value should be between 5 and 1000';
        }]
    }
] as {
    key: keyof EditorPreferences;
    label: string;
    description: string;
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

const save = () => {
    const newPreferences = {} as any;

    for (const property in values.value) {
        newPreferences[property] = values.value[property];
    }

    props.editor!.setPreferences(newPreferences);

    dialog.value = false;
};
</script>

<style scoped lang="scss">
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
