<template>
    <aside :class="classes">
        <nav>
            <ul>
                <slot name="primary"></slot>
            </ul>
            <ul class="secondary">
                <slot name="secondary"></slot>
            </ul>
        </nav>
    </aside>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref, watch} from "vue";

const props = defineProps({
    menu: {
        type: Boolean,
        default: () => false
    },
    fullControl: {
        type: Boolean,
        default: () => false
    },
    primary: {
        type: Boolean,
        default: () => false
    },
    shift: {
        type: Boolean,
        default: () => false
    },
    secondaryActive: {
        type: Boolean,
        default: () => false
    },
    side: {
        type: String,
        default: () => "left"
    }
});

const classes = computed(() => {
    return {
        "navigation": true,
        "navigation--active": props.menu,
        "navigation--primary": props.primary,
        "navigation--shift": props.shift,
        "navigation--hidden": !menuVisible.value,
        "navigation--secondary-active": props.secondaryActive,
        [`navigation--${props.side}`]: true
    }
});

const emits = defineEmits(["menuVisible"]);
const menuVisible = ref(props.menu);

watch(() => props.menu, (value) => {
    const width = window.innerWidth;

    if (width <= 768 || props.fullControl) {
        emits("menuVisible", value);
        menuVisible.value = value;
    }
});

const resize = () => {
    const width = window.innerWidth;

    if (width > 768 && !props.fullControl) {
        emits("menuVisible", true);
        menuVisible.value = true;
    }
};

onMounted(() => {
    window.addEventListener("resize", resize);
});

onUnmounted(() => {
    window.removeEventListener("resize", resize);
});
</script>

<style lang="scss" scoped>
aside.navigation {
    position: fixed;
    top: 5em;
    left: 4.5em;
    z-index: 1000;

    width: 14.5em;

    height: calc(100 * (var(--vh, 1vh)) - 5em);

    overflow-y: auto;

    padding: 1em 0;

    background-color: var(--color-navigation-background);
    border-right: var(--nagivation-border-width) solid var(--color-navigation-border);

    transition: left 0.3s ease-in-out, right 0.3s ease-in-out;

    &--hidden {
        left: -20em;
    }

    &--primary {
        left: 0;
        width: 4.5em;
        z-index: 1001;

        &.navigation--hidden {
            @media (max-width: 768px) {
                right: -4.5em;
            }
            @media (min-width: 768px) {
                left: -4.5em;
            }
        }
    }

    &--right {
        right: 0;
        left: unset;
        border-right: unset;
        border-left: var(--nagivation-border-width) solid var(--color-navigation-border);

        &.navigation--hidden {
            right: -20em;
        }
    }

    &--shift {
        padding: 0;
    }

    > nav {
        width: 100%;
        min-height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: space-between;

        gap: 2em;
        height: 100%;

        > ul {
            width: 100%;
            height: 100%;

            display: flex;
            flex-direction: column;
            justify-content: start;

            list-style: none;

            gap: 0.5em;

            ::v-deep(li) {
                width: 100%;

                padding: 0 0.5em;

                display: flex;
                justify-content: center;
                flex-shrink: 0;

                cursor: pointer;

                //overflow: hidden;

                &:has(.button--hide-desktop) {
                    @media (min-width: 768px) {
                        display: none;
                    }
                }
                &:has(.button--hide-mobile) {
                    @media (max-width: 768px) {
                        display: none;
                    }
                }
            }

            &.secondary {
                display: none;

                justify-content: end;
            }

            > ::v-deep(.dialog-activator) {
                display: flex;
                justify-content: center;

                &:has(.button--hide-desktop) {
                    @media (min-width: 768px) {
                        display: none;
                    }
                }
                &:has(.button--hide-mobile) {
                    @media (max-width: 768px) {
                        display: none;
                    }
                }
            }
        }
    }

    &.navigation--secondary-active {
        > nav > ul.secondary {
            display: flex;
        }
    }

    @media (max-width: 768px) {
        top: 5em;
        right: -16.5em;
        left: unset;

        height: calc(100 * (var(--vh, 1vh)) - 5em);

        border-right: unset;
        border-left: var(--nagivation-border-width) solid var(--color-navigation-border);

        transition: right 0.3s ease-in-out;

        padding: 1em 0;

        > nav {
            > ul {
                gap: 0.5em;
            }

            > ul.secondary {
                display: flex;
            }
        }

        &.navigation--active {
            right: 0;
            transition: right 0.3s ease-in-out;
        }


        &--right {
            left: 0;
            right: unset;
            border-left: unset;
            border-right: var(--nagivation-border-width) solid var(--color-navigation-border);

            &.navigation--hidden {
                left: -20em;
            }
        }
    }
}

</style>
