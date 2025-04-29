<template>
    <component :is="tag ? tag : 'li'" @click="to && !disabled ? ($router.push(to)) : undefined">
        <router-link v-if="to && !disabled" :aria-label="label" :class="classes" :to="to">
            <span v-if="icon" :class="{
                'mdi': true,
                [`mdi-${icon}`]: true,
            }"></span>

            <span class="label">{{ label }}</span>
        </router-link>

        <button v-else :aria-label="label" :class="classes" @click="handleClick">
            <span v-if="icon" :class="{
                'mdi': true,
                [`mdi-${icon}`]: true,
            }"></span>

            <span class="label">{{ label }}</span>
        </button>
    </component>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {RouterLink, useRoute} from "vue-router";

const props = defineProps({
    hideMobile: {
        type: Boolean,
        default: false,
    },

    icon: {
        type: String,
        default: "",
    },

    active: {
        type: Boolean,
        default: false,
    },

    tag: {
        type: String,
        default: "li",
    },

    label: {
        type: String,
        default: "",
    },

    to: {
        type: Object,
        default: () => undefined,
    },

    disabled: {
        type: Boolean,
        default: false,
    },

    tooltipText: {
        type: String,
        default: "",
    },

    tooltipPosition: {
        type: String,
        default: "right",
    },
});

const $route = useRoute();

const classes = computed(() => {
    return {
        "button": true,
        "button--active": ($route.name !== undefined && props.to?.name === $route.name) || props.active,
        "button--hide-mobile": props.hideMobile,
        "button--disabled": props.disabled,
    };
});

const emits = defineEmits(["click"]);

const handleClick = (e: any) => {
    if (!props.disabled) {
        emits("click", e)
    }
};
</script>

<style lang="scss" scoped>
button.button,
a.button {
    width: 100%;
    height: 4em;

    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 1em 1.5em;

    background-color: var(--color-navigation-button-background);
    color: var(--color-navigation-button-foreground);
    border: none;
    border-radius: 50em;
    cursor: pointer;
    box-shadow: var(--shadow-primary);
    text-decoration: none;

    transition: background-color 0.2s ease-out;

    margin: 0;
    line-height: normal;
    font-size: 0.8em;

    &:hover {
        background-color: var(--color-navigation-button-background-hover);

        transition: background-color 0.3s ease-in-out;
    }

    > span.label {
        font-size: 1.2em;
        text-align: right;
        text-decoration: none;
    }

    > span.mdi {
        color: var(--color-navigation-button-foreground);
        font-size: 2.2em;
    }

    &.button--active {
        color: var(--color-navigation-button-foreground-active);

        > span.mdi {
            color: var(--color-navigation-button-foreground-active)
        }
    }

    > ::v-deep(img) {
        width: 4.5em;
        height: 4.5em;

        border-radius: 50%;
    }

    &.button--hide-mobile {
        @media (max-width: 768px) {
            display: none;
        }
    }

    &.button--disabled {
        cursor: not-allowed;
        opacity: 0.5;

        &:focus {
            outline: none;
        }
    }
}
</style>