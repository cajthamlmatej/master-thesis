<template>
    <header>
        <div class="logo">
            <slot name="logo">
                <router-link :to="{ name: 'Dashboard' }" class="logo cursor-clickable"></router-link>

                <router-link :to="{ name: 'Dashboard' }">
                    <img :src="props.icon" alt="" class="icon cursor-clickable"
                         @click="router.push({ name: 'Dashboard' })"></router-link>
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
import {computed, onMounted, onUnmounted, watch} from "vue";

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
</script>

<style lang="scss" scoped>
header {
    position: sticky;
    top: 0;
    z-index: 1000;

    height: 5em;
    width: 100%;
    background-color: var(--color-navigation-background-accent);
    border-bottom: var(--nagivation-border-width) solid var(--color-navigation-border);

    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0 1em;


    > .logo {
        .logo {
            display: block;
            height: 4em;
            width: 192px;

            background-image: var(--logo-image);
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;

            @media (max-width: 768px) {
                display: none;
            }
        }

        .icon {
            height: 4em;
            width: auto;

            display: none;

            @media (max-width: 768px) {
                display: block;
            }

            @media (max-width: 400px) {
                display: none;
            }
        }
    }

    > nav {
        > ul {
            width: 100%;

            list-style: none;
            display: flex;
            justify-content: center;

            gap: 1.5em;

            > li#menu {
                @media (min-width: 769px) {
                    display: none;
                }
            }

            @media (max-width: 769px) {
                gap: 0.5em;
            }
        }
    }
}
</style>
