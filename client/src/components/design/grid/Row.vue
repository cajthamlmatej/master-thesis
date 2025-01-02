<template>
    <div class="row">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import type {PropType} from 'vue';
import {computed} from "vue";

const props = defineProps({
    align: {
        type: String as PropType<'start' | 'center' | 'end' | 'stretch'>,
        default: 'start',
    },

    justify: {
        type: String as PropType<'start' | 'center' | 'end' | 'space-around' | 'space-between' | 'space-evenly'>,
        default: 'start',
    },

    gap: {
        type: Number,
        default: 0.5
    },

    wrap: {
        type: Boolean,
        default: false
    }
});

const wrap = computed(() => props.wrap ? 'wrap' : 'nowrap');
</script>

<style lang="scss" scoped>
.row {
    display: flex;
    flex-direction: row;
    align-items: v-bind("props.align");
    justify-content: v-bind("props.justify");
    flex-wrap: v-bind("wrap");

    //width: calc(100% + v-bind("props.gap") * 1em);
    box-sizing: border-box;
    width: 100%;
    row-gap: calc(v-bind("props.gap") * 1em);

    //margin: 0 calc(-1 * v-bind("props.gap") * 1em / 2);

    & > ::v-deep(*) {
        flex-shrink: 0;
        width: 100%;
        max-width: 100%;
        //padding: 0 calc(v-bind("props.gap") * 1em / 2);
        padding: 0 calc(v-bind("props.gap") * 1em / 2);
    }
}
</style>