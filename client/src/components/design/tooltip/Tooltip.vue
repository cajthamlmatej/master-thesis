<template>
    <component :is="tag" v-tooltip="{
        content: props.text,
        disabled: props.disabled,
        placement: props.position
    }" :class="{ 'tooltip-container--help' : props.help }" class="tooltip-container">
        <slot/>
    </component>
</template>

<script lang="ts" setup>

const props = defineProps({
    text: {
        type: String,
        required: true
    },

    disabled: {
        type: Boolean,
        default: false
    },

    tag: {
        type: String,
        default: 'article'
    },

    position: {
        type: String,
        default: 'top',
        validator: (value: string) => ['top', 'right', 'bottom', 'left'].includes(value)
    },

    help: {
        type: Boolean,
        default: true
    }
});

</script>

<style lang="scss" scoped>
.tooltip-container {
    position: relative;
    display: inline-block;

    &--help {
        text-decoration: underline dotted var(--color-help);
        text-decoration-thickness: 1.5px;
        text-decoration-skip: none;
        text-underline-offset: 0.1rem;

        cursor: help;
    }
}
</style>
