<template>
    <Header v-model:menu="data.menu">
        <template #logo>
        </template>

        <template #navigation>
            <NavigationButton :disabled="true"
                              hide-mobile icon="solar-panel"
                              label="Dashboard"
                              tooltip-position="bottom"></NavigationButton>
        </template>
    </Header>

    <Navigation v-model:menu="data.menu" primary>
        <template #primary>
            <NavigationButton  icon="cards-variant" label="Slides" tooltip-text="Slides" @click="slidesMenu = !slidesMenu"></NavigationButton>
        </template>
    </Navigation>

    <Slides v-model:value="slidesMenu" ></Slides>

    <router-view v-slot="{ Component, route }">
        <transition mode="out-in" name="fade-ease">
            <main :key="route.name?.toString()">
                <component :is="Component"/>
            </main>
        </transition>
    </router-view>
</template>

<script lang="ts" setup>
import {reactive, ref} from "vue";
import Slides from "@/components/editor/Slides.vue";

const data = reactive({
    menu: false
});

const slidesMenu = ref(false);
</script>

<style lang="scss" scoped>
.alerts {
    position: fixed;
    bottom: 2em;
    right: 0.75em;

    z-index: 1000;
    width: 40vw;

    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
