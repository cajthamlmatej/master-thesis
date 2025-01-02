<template>
    <component :is="tag ? tag : 'div'" class="dialog-activator">
        <slot :toggle="toggle" name="activator"></slot>
    </component>

    <Teleport to="body">
        <Transition :duration="200" name="fade-ease">
            <!--            @click.self="props.persistent ? false : close()"-->
            <div v-if="proxy"
                 :class="classes"
                 class="dialog"
                 @keydown.esc="props.persistent ? false :  close()"
                 @mouseup.self="handleMouseUp">
                <div class="dialog-content" @mousedown="handleMouseDown" @mouseup="handleMouseUpOnDialog">
                    <slot :toggle="toggle"></slot>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from 'vue';

const props = defineProps({
    value: {
        type: Boolean,
        default: (() => false)
    },

    persistent: {
        type: Boolean,
        default: false
    },

    stretch: {
        type: Boolean,
        default: false
    },

    tag: {
        type: String,
        default: 'div'
    }
})

const emits = defineEmits(['update:value']);

const proxy = ref(props.value);

watch(proxy, (value) => {
    emits('update:value', value);
});

watch(() => props.value, (value) => {
    proxy.value = value;
});

const toggle = function () {
    proxy.value = !proxy.value;
};

const close = function () {
    proxy.value = false;
};

const started = ref(false);
const handleMouseDown = function () {
    if (props.persistent) {
        return;
    }

    started.value = true;
};
const handleMouseUpOnDialog = function () {
    if (props.persistent) {
        return;
    }

    started.value = false;
};

const handleMouseUp = function (evnt: MouseEvent) {
    if (props.persistent) {
        return;
    }

    if (started.value) {
        started.value = false;

        // Cancel event
        evnt.preventDefault();
        evnt.stopPropagation();
        evnt.stopImmediatePropagation();

        proxy.value = true;

        return;
    }

    close();
};

const classes = computed(() => {
    return {
        'dialog': true,
        'dialog--persistent': props.persistent,
        'dialog--stretch': props.stretch
    }
});
</script>

<style lang="scss" scoped>
.dialog {
    background-color: var(--color-dialog-background);

    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    z-index: 1000;

    //padding: 5rem 0;

    &:not(&--persistent) {
        cursor: pointer;

        > .dialog-content {
            cursor: initial;
        }
    }

    > .dialog-content {
        //max-width: 100%;
        //width: 95%;

        max-height: 70vh;

        margin: 5rem 0rem;

        overflow-y: auto;

        overflow-x: hidden;

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    &--stretch {
        > .dialog-content {
            height: 100%;

            > * {
                flex: 1;
                height: 100%;
            }

            ::v-deep(.dialog-content) {
                height: 100%;
            }
        }
    }
}

.dialog-activator {
    display: inline-block;
    width: 100%;
}
</style>