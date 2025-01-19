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
                    <ListItem v-for="property in properties" :key="property.key">
                        <div class="property">
                            <div>
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
    }
] as {
    key: keyof EditorPreferences;
    label: string;
    description: string;
    type: 'boolean' | 'number';
    validator: ((value: any) => boolean | 'string')[]
}[];

const values = ref({} as any);

watch(preferences, (value) => {
    const preferences = value as any;

    if(!preferences) return;

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
.property {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1em;

    .title {
        font-weight: bold;
        margin-bottom: 0.25em
    }

    .subtitle {
        line-height: 1.15em;
        color: var(--color-text-subtle)
    }

    .value {
        width: 30%;
        flex-shrink: 0;
    }
}
</style>
