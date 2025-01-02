<template>
    <div :class="classes">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import {computed, type PropType} from 'vue';

const props = defineProps({
    cols: {
        type: [Number, String] as PropType<number | 'auto'>,
        default: 'auto'
    },

    xl: {
        type: [Number, String] as PropType<number | 'auto'>,
        default: 'auto'
    },

    lg: {
        type: [Number, String] as PropType<number | 'auto'>,
        default: 'auto'
    },

    md: {
        type: [Number, String] as PropType<number | 'auto'>,
        default: 'auto'
    },

    sm: {
        type: [Number, String] as PropType<number | 'auto'>,
        default: 'auto'
    },
});

const classes = computed(() => {
    const cols = {} as Record<string, boolean>;

    if (props.cols !== 'auto') {
        cols['col-' + props.cols] = true;
    }

    if (props.xl !== 'auto') {
        cols['col-xl-' + props.xl] = true;
    }

    if (props.lg !== 'auto') {
        cols['col-lg-' + props.lg] = true;
    }

    if (props.md !== 'auto') {
        cols['col-md-' + props.md] = true;
    }

    if (props.sm !== 'auto') {
        cols['col-sm-' + props.sm] = true;
    }

    return {
        'col': true,
        ...cols,
    };
});
</script>

<style lang="scss" scoped>
.col {
    flex: 0 0 auto;

    @for $i from 1 through 12 {
        &.col-#{$i} {
            width: calc(100% / 12 * #{$i});
        }
    }

    @for $i from 1 through 12 {
        &.col-sm-#{$i} {
            @media (min-width: 576px) {
                width: calc(100% / 12 * #{$i});
            }
        }
    }

    @for $i from 1 through 12 {
        &.col-md-#{$i} {
            @media (min-width: 768px) {
                width: calc(100% / 12 * #{$i});
            }
        }
    }

    @for $i from 1 through 12 {
        &.col-lg-#{$i} {
            @media (min-width: 992px) {
                width: calc(100% / 12 * #{$i});
            }
        }
    }

    @for $i from 1 through 12 {
        &.col-xl-#{$i} {
            @media (min-width: 1400px) {
                width: calc(100% / 12 * #{$i});
            }
        }
    }

}
</style>