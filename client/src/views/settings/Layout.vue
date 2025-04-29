<template>
    <Header :has-menu="false">
        <template #logo>
        </template>

        <template #navigation>
            <ChangeLanguage neverHide></ChangeLanguage>

            <NavigationButton :label="$t('layout.base.dashboard')"
                              :to="{name: 'Dashboard'}"
                              :tooltip-text="$t('layout.base.dashboard')"
                              icon="solar-panel"></NavigationButton>
        </template>
    </Header>

    <router-view v-slot="{ Component, route }">
        <transition mode="out-in" name="fade-ease">
            <main :key="route.name?.toString()" class="main--menu">
                <component :is="Component"/>
            </main>
        </transition>
    </router-view>
</template>

<script lang="ts" setup>
import {reactive} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";
import {useUserStore} from "@/stores/user";
import {$t} from "@/translation/Translation";
import ChangeLanguage from "@/components/ChangeLanguage.vue";

const data = reactive({
    menu: true
});

const authenticationStore = useAuthenticationStore();
const userStore = useUserStore();

const isProduction = import.meta.env.MODE !== 'development';
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
