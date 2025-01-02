<template>
    <router-link v-if="to" :aria-label="label" :class="classes" :to="to">
        <p>
            <slot></slot>
        </p>

        <span v-if="icon" :class="{
            mdi: true,
            ['mdi-' + icon]: true,
        }"></span>
    </router-link>

    <a v-else-if="href" :aria-label="label" :class="classes" :href="href" rel="noopener noreferrer" target="_blank">
        <p>
            <slot></slot>
        </p>

        <span v-if="icon" :class="{
            mdi: true,
            ['mdi-' + icon]: true,
        }"></span>
    </a>

    <button v-else :aria-label="label" :class="classes" @click="onClick">
        <p>
            <slot></slot>
        </p>

        <span v-if="icon" :class="{
            mdi: true,
            ['mdi-' + icon]: true,
        }"></span>

        <div v-if="loadingProxy" class="loading">
            <span class="mdi mdi-loading mdi-spin"></span>
        </div>
    </button>
</template>

<script lang="ts" setup>
import {computed, ref, useSlots, watch} from "vue";
import {useRoute} from "vue-router";

const props = defineProps({
    fluid: {
        type: Boolean,
        default: false,
    },
    align: {
        type: String,
        default: "left",
    },
    color: {
        type: String,
        default: "primary"
    },
    label: {
        type: String,
        default: "",
    },

    icon: {
        type: String,
        default: "",
    },
    iconSize: {
        type: Number,
        default: 1.65,
    },

    to: {
        type: Object,
        default: () => undefined,
    },
    href: {
        type: String,
        default: "",
    },


    disabled: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    active: {
        type: Boolean,
        default: false,
    },
    dense: {
        type: Boolean,
        default: false,
    },
});

const $route = useRoute();
const $slots = useSlots();

const classes = computed(() => {
    const classes = {
        "button": true,
        "button--fluid": props.fluid,
        "button--active": props.to?.name === $route.name || props.active,
        "button--disabled": props.disabled,
        "button--loading": loadingProxy.value,
        "button--empty": !$slots.default,
        "button--dense": props.dense,
    } as Record<string, boolean>;

    classes["button--" + props.color] = true;

    return classes;
});


const emits = defineEmits(["click"]);
const onClick = (e: MouseEvent) => {
    if (props.disabled) return;
    if (props.loading) return;

    if (props.to) return;

    emits("click", e);
};

const loadingProxy = ref(false);
const loading = ref(undefined as NodeJS.Timeout | undefined);

watch(() => props.loading, (loadingValue) => {
    if (loadingValue) {
        loadingProxy.value = true;
    } else {
        if (loading) {
            clearTimeout(loading.value);
        }

        loading.value = setTimeout(() => {
            loadingProxy.value = false;
        }, 500);
    }
}, {immediate: true});


const iconSize = computed(() => {
    return props.iconSize + "em";
});
</script>

<style lang="scss" scoped>
.button {
    position: relative;

    padding: 0.4em 0.8em;

    display: flex;
    justify-content: space-between;
    align-items: center;

    border: none;
    border-radius: 0.4em;
    cursor: pointer;

    font-size: 1em;
    font-weight: 600;

    text-transform: uppercase;
    text-decoration: none;
    color: var(--button-text-color);
    line-height: 1.4em;

    transition: background-color 0.2s ease-out;

    background-color: var(--background-color);


    &:before {
        transition: 0.2s ease-out all;

        background-color: #00000000;
        opacity: 0;

        content: "";

        width: 100%;
        height: 100%;

        position: absolute;
        top: 0;
        left: 0;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    span {
        font-size: v-bind("iconSize");
        font-weight: 600;
        margin-left: 0.5em;
    }

    p {
        flex-basis: auto;
        flex-grow: 5;

        text-align: v-bind("props.align");
    }

    &.button--fluid {
        width: 100%;
    }

    &.button--active {
        position: relative;

        &:after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            border-radius: 0.4em;
            background-color: var(--button-text-color);
            opacity: 0.1;
        }
    }

    &.button--disabled {
        cursor: not-allowed;
        background-color: var(--background-color-disabled);
        position: relative;

        > * {
            opacity: 0.5;
        }

        &:after {
            display: none;
        }

        &:hover {
            background-color: var(--background-color-disabled);
        }

        &:focus {
            outline: none;
        }
    }

    &.button--loading {
        cursor: not-allowed;
        position: relative;
        background-color: var(--background-color-disabled);

        > * {
            opacity: 0.5;
        }

        &:before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            z-index: 10;
            opacity: 1;

            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            background-color: var(--color-button-disabled-background);

            border-radius: 0.4em;

            translate: all ease-out 0.2s;
        }

        .loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 20;
            opacity: 1;

            display: flex;
            justify-content: center;
            align-items: center;

            font-size: 1.65em;
            font-weight: 600;
        }

        &:hover {
            background-color: var(--background-color-disabled);
        }
    }

    &.button--empty {
        > span {
            margin-left: 0;
        }
    }

    &.button--dense {
        padding: 0.2em 0.2em;
    }

    &:hover {
        background-color: var(--background-color-hover);

        transition: background-color 0.3s ease-in-out;
    }


    // Colors
    &--primary {
        --background-color: var(--color-button-primary-background);
        --background-color-hover: var(--color-button-primary-background-hover);
        --background-color-active: var(--color-button-primary-background-active);
        --background-color-disabled: var(--color-button-primary-background-disabled);
        --button-text-color: var(--color-button-primary-foreground);
    }

    &--neutral {
        --background-color: var(--color-button-neutral-background);
        --background-color-hover: var(--color-button-neutral-background-hover);
        --background-color-active: var(--color-button-neutral-background-active);
        --background-color-disabled: var(--color-button-neutral-background-disabled);
        --button-text-color: var(--color-button-neutral-foreground);
    }

    &--transparent {
        --background-color: transparent;
        --background-color-hover: rgba(0, 0, 0, 0.1);
        --background-color-active: rgba(0, 0, 0, 0.2);
        --background-color-disabled: rgba(0, 0, 0, 0.05);
        --button-text-color: inherit;
    }
}
</style>