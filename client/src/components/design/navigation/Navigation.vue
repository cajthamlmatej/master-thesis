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
    }
});

const classes = computed(() => {
    return {
        "navigation": true,
        "navigation--active": props.menu,
        "navigation--primary": props.primary,
        "navigation--shift": props.shift,
        "navigation--hidden": !menuVisible.value
    }
});

const emits = defineEmits(["menuVisible"]);
const menuVisible = ref(false);

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

    width: 12.5em;

    height: calc(100 * (var(--vh, 1vh)) - 5em);

    overflow-y: auto;

    padding: 1em 0;

    background-color: var(--color-navigation-background);
    border-right: var(--nagivation-border-width) solid var(--color-navigation-border);

    transition: left 0.3s ease-in-out;

    &--hidden {
        left: -20em;
    }

    &--primary {
        left: 0;
        width: 4.5em;
        z-index: 1001;

        &--hidden {
            left: -4.5em;
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

        > ul {
            width: 100%;

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
            }

            &.secondary {
                display: none;

                justify-content: end;
            }

            > ::v-deep(.dialog-activator) {
                display: flex;
                justify-content: center;
            }
        }
    }

    @media (max-width: 768px) {
        top: 5em;
        right: -12.5em;
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
    }
}

</style>
