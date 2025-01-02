<template>
    <hr :class="classes"/>
</template>

<script lang="ts" setup>
import {computed} from 'vue';

const props = defineProps({
    vertical: {
        type: Boolean,
        default: false,
    },
});

const classes = computed(() => ({
    'divider': true,
    'divider--vertical': props.vertical,
}));
</script>

<style lang="scss" scoped>
.divider {
    position: relative;

    display: block;

    width: 100%;
    height: var(--divider-width);
    flex-shrink: 0;
    flex-grow: 0;

    border-radius: 5px;
    border: none;

    margin: 1em 0;

    background-color: var(--color-background);

    &.divider--vertical {
        width: var(--divider-width);
        height: 100%;

        margin: 0 1em;
    }
}
</style>