<template>
    <article :class="classes" :data-value="props.value" @click="tabSelected">
        {{ props.text }}
    </article>
</template>

<script lang="ts" setup>
import {computed} from "vue";

const props = defineProps({
    text: {
        type: String,
    },
    value: {
        type: String,
    },
    selected: {
        type: String,
    },
});

const emit = defineEmits(['update:selected'])
const tabSelected = () => {
    emit('update:selected', props.value);
};

const classes = computed(() => {
    return {
        "tab": true,
        "tab--active": props.selected === props.value,
    };
});
</script>

<style lang="scss" scoped>
.tab {
    padding: 1em;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: var(--color-tab-background);
    border: none;
    //border-bottom: var(--tab-border-width) solid var(--color-tab-border);

    cursor: pointer;

    text-transform: uppercase;
    font-weight: 600;
    white-space: nowrap;

    border-radius: 0.5em;

    color: var(--color-tab-text);

    transition: border-bottom 0.5s ease-out, background-color 0.2s ease-out;

    &.tab--active {
        background-color: var(--color-tab-background-active);
    }

    &:hover {
        background-color: var(--color-tab-background-hover);
    }
}
</style>
