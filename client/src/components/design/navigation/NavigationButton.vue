<template>
    <component :is="tag ? tag : 'li'" @click="to && !disabled ? ($router.push(to)) : undefined">
        <tooltip :disabled="props.tooltipText.length === 0 || props.disabled" :help="false"
                 :position="tooltipPosition"
                 :text="props.tooltipText">
            <router-link v-if="to && !disabled" :aria-label="label" :class="classes" :to="to">
                <span v-if="icon" :class="{
                    'mdi': true,
                    [`mdi-${icon}`]: true,
                }"></span>
                <slot></slot>
            </router-link>

            <button v-else :aria-label="label" :class="classes" @click="handleClick">
                <span v-if="icon" :class="{
                    'mdi': true,
                    [`mdi-${icon}`]: true,
                }"></span>
                <slot></slot>
            </button>
        </tooltip>
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
    hideDesktop: {
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
        "button--hide-desktop": props.hideDesktop,
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
    width: 4em;
    height: 4em;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: var(--color-navigation-button-background);
    color: var(--color-navigation-button-foreground);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: var(--shadow-primary);

    transition: background-color 0.2s ease-out;

    padding: 0;
    margin: 0;
    line-height: normal;
    font-size: 0.8em;

    &:hover {
        background-color: var(--color-navigation-button-background-hover);

        transition: background-color 0.3s ease-in-out;
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
    &.button--hide-desktop {
        @media (min-width: 768px) {
            display: none;
        }
    }

    &.button--show-mobile {
        @media (min-width: 768px) {
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

li {
    list-style: none;
}
</style>
