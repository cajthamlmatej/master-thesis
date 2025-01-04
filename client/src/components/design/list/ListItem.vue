<template>
    <article v-if="!to && !href" :class="classes">
        <slot/>
    </article>

    <a v-else-if="href" :class="classes" :href="href" rel="noopener noreferrer" target="_blank">
        <slot/>
    </a>

    <router-link v-else v-slot="{ navigate, href }" :to="to" custom>
        <a :class="classes" :href="href" role="link" @click="navigate" @keypress.enter="(navigate as any)">
            <slot/>
        </a>
    </router-link>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useRoute} from 'vue-router';

const props = defineProps({
    to: {
        type: Object,
        default: null,
    },
    href: {
        type: String,
        default: null,
    },

    hover: {
        type: Boolean,
        default: false,
    },

    active: {
        type: Boolean,
        default: undefined,
    },

    mark: {
        type: Boolean,
        default: false,
    },

    disabled: {
        type: Boolean,
        default: false,
    },


    class: {
        type: String,
        default: '',
    },
});

const $route = useRoute();

const classes = computed(() => ({
    'list-item': true,
    'list-item--hover': props.hover || props.to || props.href,
    'list-item--active': props.active !== undefined ? props.active : ($route.name !== undefined && props.to?.name === $route.name),
    'list-item--mark': props.mark,
    'list-item--disabled': props.disabled,
    [props.class]: true,
}));
</script>

<style lang="scss" scoped>
.list-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;

    border-top: var(--list-border-width) solid var(--color-list-border);

    color: var(--color-list-text);
    text-decoration: none;

    cursor: default;

    //&:first-child {
    //    border-top-left-radius: 0.4em;
    //    border-top-right-radius: 0.4em;
    //}
    //
    //&:last-child {
    //    border-bottom-left-radius: 0.4em;
    //    border-bottom-right-radius: 0.4em;
    //}

    &.list-item--mark {
        position: relative;

        &:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: var(--list-mark-width);
            height: 100%;
            border-bottom-left-radius: 4px;
            border-top-left-radius: 4px;
            background-color: var(--color-list-mark);
        }
    }

    &.list-item--hover {
        transition: background-color 0.2s;
        cursor: pointer;

        &:hover {
            background-color: var(--color-list-background-hover);
        }
    }

    &.list-item--active {
        background-color: var(--color-list-background-active);
    }

    &.list-item--disabled {
        cursor: not-allowed;
        opacity: 0.5;
        user-select: none;
    }
}
</style>