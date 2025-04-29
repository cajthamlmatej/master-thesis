<template>
    <VDropdown
        :hideTriggers="['click']"
        :showTriggers="['click']"
        placement="bottom"
    >
        <!--        :showTriggers="['hover', 'click']"-->
        <!--        :hideTriggers="['click', 'hover']"-->
        <NavigationButton
            :icon="attendees.length <= 1 ? 'account':'account-multiple'"
            :tooltip-position="'bottom'"
            :tooltip-text="$t('editor.attendees.title')"
        ></NavigationButton>

        <template #popper>
            <div class="attendee-dropdown">
                <div v-for="attendee in attendees" :key="attendee.attendee.id" class="attendee">
                    <span :style="{
                            '--color': attendee.attendee.color,
                        }"
                          class="visualiser"
                    >
                        {{ attendee.attendee.icon }}
                    </span>
                    <span class="name">
                        {{ attendee.attendee.name }}
                    </span>
                    <span v-if="attendee.current" class="current">
                        ({{ $t('editor.attendees.current') }})
                    </span>
                </div>
            </div>
        </template>
    </VDropdown>
</template>

<script lang="ts" setup>

import {communicator} from "@/api/websockets";
import {onMounted, ref} from "vue";
import {useMaterialStore} from "@/stores/material";
import {$t} from "@/translation/Translation";
import NavigationButton from "@/components/design/navigation/NavigationButton.vue";
import {EditorCommunicator} from "@/api/editorCommunicator";
import {EditorAttendee} from "@/api/editorAttendee";

const materialStore = useMaterialStore();

let editorRoom: EditorCommunicator;

onMounted(async () => {
    editorRoom = communicator.getEditorRoom()!;
    updateAttendees();
    editorRoom.EVENTS.ATTENDEE_CHANGES.on(() => {
        updateAttendees();
    });
});

const attendees = ref<{
    attendee: EditorAttendee,
    current: boolean
}[]>([]);

function updateAttendees() {
    const current = editorRoom.getCurrent();
    attendees.value = editorRoom.getAttendees().map((attendee) => ({
        attendee,
        current: current === attendee,
    }))
}
</script>

<style lang="scss" scoped>
div.attendee-dropdown {
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(18px);
    display: flex;
    flex-direction: column;
    border-radius: 1em;
    padding: 1em;
    gap: 0.5em;

    .attendee {
        display: flex;
        align-items: center;
        gap: 0.5em;

        .visualiser {
            width: 2em;
            height: 2em;
            border-radius: 50%;
            background-color: var(--color);
            margin-right: 0.5em;

            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>
