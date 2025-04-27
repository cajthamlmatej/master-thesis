<template>
    <header :class="classes">
        <div class="logo">
            <slot name="logo">
                <router-link :aria-label="$t('web.name')" :to="{ name: 'Dashboard' }"
                             class="icon cursor-clickable"></router-link>
            </slot>
        </div>

        <nav>
            <ul>
                <slot name="navigation">
                </slot>

                <NavigationButton v-if="props.hasMenu" id="menu" :icon="props.menu ? 'close' : 'menu' "
                                  label="Show navigation"
                                  @click="toggleMenu"/>
            </ul>
        </nav>
    </header>
</template>

<script lang="ts" setup>
import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {$t} from "@/translation/Translation";

const props = defineProps({
    hasMenu: {
        type: Boolean,
        default: true
    },

    menu: {
        type: Boolean,
        default: () => false
    },

    icon: {
        type: String,
    },

    active: {
        type: Boolean,
        default: true
    },

    fixed: {
        type: Boolean,
        default: false
    }
});

const emits = defineEmits(["update:menu"]);

const toggleMenu = () => {
    emits("update:menu", !props.menu);
};

const router = useRouter();

// On route change, close the menu
const route = useRoute();
watch(route, () => {
    emits("update:menu", false);
});

const closeMenu = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    // If menu is ope
    if (props.menu) {
        // If target is not the menu button
        if (target.id !== "menu") {
            // If target is not a child of the menu button
            if (!target.closest("#menu")) {
                emits("update:menu", false);
            }
        }
    }
};

onMounted(() => {
    document.addEventListener("click", closeMenu);
})

onUnmounted(() => {
    document.removeEventListener("click", closeMenu);
})

const classes = computed(() => {
    return {
        "header--active": props.active,
        "header--fixed": props.fixed,
        "header--scrolled": scrolled.value
    }
});

const scrolled = ref(false);

const scroll = () => {
    if (window.scrollY > 0) {
        scrolled.value = true;
    } else {
        scrolled.value = false;
    }
};

onMounted(() => {
    window.addEventListener("scroll", scroll);
});

onUnmounted(() => {
    window.removeEventListener("scroll", scroll);
});
</script>

<style lang="scss" scoped>
header {
    position: sticky;
    top: -5em;
    z-index: 1000;

    height: 5em;
    width: 100%;
    background-color: var(--color-navigation-background-accent);
    backdrop-filter: blur(18px);
    //border-bottom: var(--nagivation-border-width) solid var(--color-navigation-border);

    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0 1em;

    transition: top 0.3s ease-in-out;

    &.header--active {
        top: 0;
    }

    &.header--fixed {
        position: fixed;
    }

    > .logo {
        position: relative;

        .icon {
            display: block;
            position: relative;
            left: -0.6em;
            height: 4em;
            width: 5em;

            &::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;

                height: 100%;
                width: 2em;

                display: flex;
                align-items: center;

                background: var(--logo-image) no-repeat center;
                background-size: contain;
                font-size: 2.5em;
                font-weight: bold;
                letter-spacing: -0.1em;
                transition: filter 0.3s ease-in-out;
            }


            &:hover {
                &::before {
                    cursor: pointer;
                    filter: brightness(1.2) contrast(1.2) drop-shadow(0 0 0.1em rgba(37, 16, 100, 0.28));
                }
            }
        }
    }

    > nav {
        > ul {
            width: 100%;

            list-style: none;
            display: flex;
            justify-content: center;

            gap: 0.5em;

            > li#menu {
                @media (min-width: 769px) {
                    display: none;
                }
            }

            @media (max-width: 769px) {
                gap: 0.5em;
            }

            > ::v-deep(li) {
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

    &.header--scrolled {
        background-color: var(--color-navigation-background-active);
    }

}
</style>
