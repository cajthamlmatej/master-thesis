<template>
    <Transition name="fade">
        <article v-if="visible" :class="classes">
            <slot></slot>

            <span v-if="props.dismissible" class="alert-icon mdi mdi-close" @click="visible = false"></span>
        </article>
    </Transition>
</template>

<script lang="ts" setup>
import {computed, ref, useSlots, watch} from "vue";

const props = defineProps({
    type: {
        type: String,
        default: 'info',
        validator: (value: string) => ['info', 'success', 'warning', 'error'].includes(value)
    },

    fluid: {
        type: Boolean,
        default: true
    },

    dismissible: {
        type: Boolean,
        default: false
    },

    // TODO: Add support for custom icon
});

const visible = ref(true);
const $slots = useSlots();

// If body changes, make alert visible again
watch(() => $slots.default, () => visible.value = true);

const classes = computed(() => ({
    'alert': true,
    [`alert--${props.type}`]: true,
    'alert--fluid': props.fluid
}));
</script>

<style lang="scss" scoped>
.alert {
    display: flex;
    align-items: center;
    padding: 1rem;
    justify-content: space-between;

    border-radius: 0.5rem;
    background-color: var(--background-color);
    color: var(--color);

    &--info {
        --background-color: var(--color-alert-info-background);
        --color: var(--color-alert-info-foreground);
    }

    &--success {
        --background-color: var(--color-alert-success-background);
        --color: var(--color-alert-success-foreground);
    }

    &--warning {
        --background-color: var(--color-alert-warning-background);
        --color: var(--color-alert-warning-foreground);
    }

    &--error {
        --background-color: var(--color-alert-error-background);
        --color: var(--color-alert-error-foreground);
    }

    &--fluid {
        width: 100%;
    }

    ::v-deep(a:not(.button)) {
        color: var(--color);
        text-decoration: underline 2px var(--color);
    }

    .alert-icon {
        margin-left: 0.5em;
        cursor: pointer;
        font-size: 1.5rem;
    }
}
</style>