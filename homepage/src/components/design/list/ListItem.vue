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

    border-top: 1px solid #cab9e7;
    text-decoration: none;

    cursor: default;

    &.list-item--hover {
        transition: background-color 0.2s;
        cursor: pointer;

        &:hover {
            background-color: #cab9e7;
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
