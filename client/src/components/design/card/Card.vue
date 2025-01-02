<template>
    <section :class="classes">
        <slot/>
    </section>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

const props = defineProps({
    fluid: {
        type: Boolean,
        default: false,
    },

    dialog: {
        type: Boolean,
        default: false,
    },

    stretch: {
        type: Boolean,
        default: false,
    },
});

const classes = computed(() => ({
    'card': true,
    'card--fluid': props.fluid,
    'card--dialog': props.dialog,
    'card--stretch': props.stretch,
}));
</script>

<style lang="scss" scoped>
.card {
    position: relative;

    width: min-content;
    padding: 1em;

    background-color: var(--color-card-background);
    border-radius: 0.5em;
    box-shadow: var(--shadow-primary);

    &.card--dialog {
        width: 600px;

        @media (max-width: 768px) {
            width: 95%;
        }
    }

    &.card--fluid {
        width: 100%;
    }

    &.card--stretch {
        flex: 1;
    }

    ::v-deep(.title) {
        font-size: 1.3em;
        font-weight: bold;

        margin: 0 0 1em;

        &.mb-0 {
            margin-bottom: 0;
        }
    }
}
</style>