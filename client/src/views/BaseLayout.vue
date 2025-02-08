<template>
    <Header v-model:menu="data.menu">
        <template #logo>
        </template>

        <template #navigation>
            <NavigationButton :disabled="true"
                              hide-mobile
                              icon="account-cog"
                              label="Settings"
                              tooltip-position="bottom"></NavigationButton>


            <ChangeLanguage></ChangeLanguage>

            <NavigationButton hide-mobile icon="logout"
                              tag="li"
                              tooltip-position="bottom"
                              :label="$t('layout.base.logout')"
                              :tooltip-text="$t('layout.base.logout')"
                              @click="authenticationStore.logout()"></NavigationButton>
        </template>
    </Header>

    <Navigation v-model:menu="data.menu" primary>
        <template #primary>
            <NavigationButton :to="{name: 'Dashboard'}"
                              icon="solar-panel"
                              :label="$t('layout.base.dashboard')"
                              :tooltip-text="$t('layout.base.dashboard')"></NavigationButton>

            <NavigationButton icon="book-open-outline"
                              disabled
                              label="Browse materials"
                              tooltip-text="Browse materials"
            ></NavigationButton>

            <NavigationButton icon="border-radius"
                              disabled
                              label="Browse templates"
                              tooltip-text="Browse templates"
            ></NavigationButton>
        </template>

        <template #secondary>
            <NavigationButton :disabled="true" icon="cog-outline"
                              label="Settings">
            </NavigationButton>
            <NavigationButton icon="logout"
                              tag="li"
                              :label="$t('layout.base.logout')"
                              @click="authenticationStore.logout()"></NavigationButton>
        </template>
    </Navigation>

    <section class="alerts">
        <!--        <Alert v-if="!isProduction" dismissible type="info">-->
        <!--            This version of the page is in testing mode. Do not expect real information and data.-->
        <!--        </Alert>-->
    </section>
    <!-- TODO:        <AuthenticationObserver />-->

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
import {$t} from "@/translation/Translation";
import ChangeLanguage from "@/components/ChangeLanguage.vue";

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
