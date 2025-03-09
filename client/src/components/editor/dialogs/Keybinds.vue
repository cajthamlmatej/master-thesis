<template>

    <Dialog v-model:value="keybindsDialog">
        <template #default>
            <Card dialog>
                <p v-t class="title">editor.keybinds.title</p>

                <List>
                    <ListItem v-for="keybind in keybindings" :key="keybind.action">
                        <span class="keybind">
                            <span v-for="key in keybind.key"
                                  :key="key"
                                  v-tooltip="key.endsWith('?') && key.length > 1 ? $t('editor.keybinds.optional-key') : ''"
                                  class="key">
                                {{ key }}
                            </span>
                        </span>
                        <span class="action">{{ keybind.action }}</span>
                    </ListItem>
                </List>
            </Card>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref, watch} from "vue";
import ListItem from "@/components/design/list/ListItem.vue";
import {$t, translation} from "@/translation/Translation";
import {useEditorStore} from "@/stores/editor";


const keybindsDialog = ref(false);

const keydown = (event: KeyboardEvent) => {
    if (event.key === 'F1') {
        keybindsDialog.value = !keybindsDialog.value;
        event.preventDefault();
    }

    if (event.key === 'Escape') {
        keybindsDialog.value = false;
        event.preventDefault();
    }
};

onMounted(() => {
    window.addEventListener('keydown', keydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', keydown);
});

watch(() => keybindsDialog.value, (value) => {
    if (value) {
        recalculate();
    }
});

const keybindings = ref<Array<{ key: string[], action: string }>>([]);

const humanizeKeybind = (keybind: {
    key: string;
    ctrlKey: 'ALWAYS' | 'NEVER' | 'OPTIONAL';
    shiftKey: 'ALWAYS' | 'NEVER' | 'OPTIONAL';
    altKey: 'ALWAYS' | 'NEVER' | 'OPTIONAL';
}) => {
    let press = [];

    if (keybind.ctrlKey === 'ALWAYS' || keybind.ctrlKey === 'OPTIONAL') {
        let key = $t('editor.keybinds.modifier.ctrl');

        if (keybind.ctrlKey === 'OPTIONAL') {
            key += '?';
        }

        press.push(key);
    }

    if (keybind.shiftKey === 'ALWAYS' || keybind.shiftKey === 'OPTIONAL') {
        press.push($t('editor.keybinds.modifier.shift'));

        if (keybind.shiftKey === 'OPTIONAL') {
            press.push('?');
        }
    }

    if (keybind.altKey === 'ALWAYS' || keybind.altKey === 'OPTIONAL') {
        press.push($t('editor.keybinds.modifier.alt'));

        if (keybind.altKey === 'OPTIONAL') {
            press.push('?');
        }
    }

    if (translation.doesKeyExist('editor.keybinds.key.' + keybind.key)) {
        press.push($t('editor.keybinds.key.' + keybind.key));
    } else {
        // Split by uppercase letters
        const splitted = keybind.key.split(/(?=[A-Z])/);
        const humanized = splitted.map((p, i) => {
            if (i === 0) {
                return p;
            }

            return p.toLowerCase();
        }).join(' ');

        press.push(humanized);
    }
    return press;
}

const editorStore = useEditorStore();
const recalculate = () => {
    let keybinds = [];

    for (let keybind of editorStore.getEditor()!.getKeybinds().getKeybinds()) {
        keybinds.push({
            key: humanizeKeybind(keybind.keybind),
            action: $t('editor.action.' + keybind.action.name + '.label')
        });
    }

    keybindings.value = keybinds;
};
</script>

<style lang="scss" scoped>
.keybind {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .key {
        padding: 0.25rem 0.5rem;
        background-color: var(--color-button-primary-background);
        color: var(--color-button-primary-foreground);
        border-radius: 0.25rem;
    }
}

.action {
    flex-grow: 1;
    text-align: right;
    font-weight: bold;
    font-size: 1.25rem;
}
</style>
