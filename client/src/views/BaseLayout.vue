<template>
    <Header v-model:menu="data.menu">
        <template #logo>
        </template>

        <template #navigation>
            <NavigationButton icon="cog-outline"
                              :to="{name: 'UserSettings'}"
                              hide-mobile
                              tooltip-position="bottom"
                              :label="$t('layout.base.settings')"
                              :tooltip-text="$t('layout.base.settings')"></NavigationButton>

            <ChangeLanguage></ChangeLanguage>

            <NavigationButton :label="$t('layout.base.logout')" :tooltip-text="$t('layout.base.logout')"
                              hide-mobile
                              data-cy="logout"
                              icon="logout"
                              tag="li"
                              tooltip-position="bottom"
                              @click="authenticationStore.logout()"></NavigationButton>
        </template>
    </Header>

    <Navigation v-model:menu="data.menu" primary>
        <template #primary>
            <NavigationButton :label="$t('layout.base.dashboard')"
                              :to="{name: 'Dashboard'}"
                              :tooltip-text="$t('layout.base.dashboard')"
                              icon="solar-panel"></NavigationButton>

            <NavigationButton :to="{name: 'Featured'}"
                              icon="book-open-outline"
                              :label="$t('layout.base.featured')"
                              :tooltip-text="$t('layout.base.featured')">
            </NavigationButton>

<!--            <NavigationButton disabled-->
<!--                              icon="border-radius"-->
<!--                              label="Browse templates"-->
<!--                              tooltip-text="Browse templates"-->
<!--            ></NavigationButton>-->

            <NavigationButton :to="{name: 'Plugins'}"
                              icon="package-variant"
                              label="Plugins"
                              tooltip-text="Plugins"
            ></NavigationButton>
        </template>

        <template #secondary>
            <NavigationButton icon="cog-outline"
                              :to="{name: 'UserSettings'}"
                              :label="$t('layout.base.settings')">
            </NavigationButton>
            <NavigationButton :label="$t('layout.base.logout')"
                              icon="logout"
                              data-cy="logout-telephone"
                              tag="li"
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
import Navigation from "@/components/design/navigation/Navigation.vue";

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
