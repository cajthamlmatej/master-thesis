<template>
    <section :class="classes">
        <slot/>
    </section>
</template>

<script lang="ts" setup>
import {computed} from 'vue';

const props = defineProps({
    dense: {
        type: Boolean,
        default: false,
    },
});

const classes = computed(() => ({
    'list': true,
    'list--dense': props.dense,
}));
</script>

<style lang="scss" scoped>
.list {
    width: 100%;
    display: flex;
    flex-direction: column;

    background-color: #dfd7e5;
    border-radius: 1em;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);

    //border: var(--list-border-width) solid var(--color-list-border);

    //overflow: hidden;

    &.list--dense {
        ::v-deep(.list-item) {
            padding: 0.5em 1em;
        }
    }

    > :first-child, > ::v-deep(.dialog-activator:first-child .list-item) {
        border-top: none;
        border-top-left-radius: 1em;
        border-top-right-radius: 1em;
    }

    > :last-child, > ::v-deep(.dialog-activator:last-child .list-item) {
        border-bottom-left-radius: 1em;
        border-bottom-right-radius: 1em;
    }

    > :nth-child(1) {
        border-top: none;
    }
}
</style>
