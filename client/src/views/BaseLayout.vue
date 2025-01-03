<template>
    <Header v-model:menu="data.menu">
        <template #logo>
        </template>

        <template #navigation>
            <NavigationButton :disabled="true"
                              hide-mobile icon="cog-outline"
                              label="Settings"
                              tooltip-position="bottom"></NavigationButton>

            <NavigationButton hide-mobile icon="logout"
                              label="Logout"
                              tag="li"
                              tooltip-position="bottom"
                              tooltip-text="Logout" @click="authenticationStore.logout()"></NavigationButton>
        </template>
    </Header>

    <Navigation v-model:menu="data.menu">
        <template #primary>
            <NavigationItem :to="{name: 'Dashboard'}" icon="solar-panel" label="Dashboard" tooltip-text="Dashboard"></NavigationItem>
            <NavigationItem :to="{name: 'Editor'}" icon="pencil-ruler" label="Editor" tooltip-text="Editor"></NavigationItem>
        </template>

        <template #secondary>
            <NavigationItem :disabled="true" icon="cog-outline"
                            label="Settings">
            </NavigationItem>
            <NavigationItem icon="logout" label="Logout"
                            tag="li"
                            @click="authenticationStore.logout()"></NavigationItem>
        </template>
    </Navigation>

    <section class="alerts">
        <Alert v-if="!isProduction" dismissible type="info">
            This version of the page is in testing mode. Do not expect real information and data.
        </Alert>

<!-- TODO:        <AuthenticationObserver />-->
    </section>

    <router-view v-slot="{ Component, route }">
        <transition mode="out-in" name="fade-ease">
            <main :key="route.name?.toString()">
                <component :is="Component"/>
            </main>
        </transition>
    </router-view>
</template>

<script lang="ts" setup>
import {reactive} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";
import {useUserStore} from "@/stores/user";

const data = reactive({
    menu: false
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
