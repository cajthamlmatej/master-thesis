<template>
    <Header v-model:menu="data.menu">
        <template #logo>
        </template>

        <template #navigation>
            <NavigationButton :label="$t('layout.base.settings')"
                              :to="{name: 'UserSettings'}"
                              :tooltip-text="$t('layout.base.settings')"
                              hide-mobile
                              icon="cog-outline"
                              tooltip-position="bottom"></NavigationButton>

            <ChangeLanguage></ChangeLanguage>

            <NavigationButton :label="$t('layout.base.logout')" :tooltip-text="$t('layout.base.logout')"
                              data-cy="logout"
                              hide-mobile
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

            <NavigationButton :label="$t('layout.base.featured')"
                              :to="{name: 'Featured'}"
                              :tooltip-text="$t('layout.base.featured')"
                              icon="book-open-outline">
            </NavigationButton>

            <!--            <NavigationButton disabled-->
            <!--                              icon="border-radius"-->
            <!--                              :label="Browse templates"-->
            <!--                              tooltip-text="Browse templates"-->
            <!--            ></NavigationButton>-->

            <NavigationButton :label="$t('layout.base.plugins')"
                              :to="{name: 'Plugins'}"
                              :tooltip-text="$t('layout.base.plugins')"
                              icon="package-variant"
            ></NavigationButton>

            <Dialog>
                <template #activator="{toggle}">
                    <NavigationButton :label="$t('layout.base.info.tooltip')"
                                      :tooltip-text="$t('layout.base.info.tooltip')"
                                      class="mt-2"
                                      icon="information-slab-circle-outline"
                                      @click="toggle"
                    ></NavigationButton>
                </template>
                <template #default>
                    <Card dialog>
                        <p v-t class="title">layout.base.info.title</p>

                        <p v-t>layout.base.info.description</p>

                        <p class="mt-1"><b v-t>layout.base.info.version</b>: {{ version }}</p>

                        <div class="flex flex-column gap-1 flex-wrap mt-1">
                            <Button :href="homepage" target="_blank">
                                <span v-t>layout.base.info.homepage</span>
                            </Button>
                            <Button :href="docs" target="_blank">
                                <span v-t>layout.base.info.docs</span>
                            </Button>
                            <Button :href="`${homepage}${route.params.lang}/terms-of-service`" target="_blank">
                                <span v-t>layout.base.info.terms-of-service</span>
                            </Button>
                            <Button :href="`${homepage}${route.params.lang}/privacy-policy`" target="_blank">
                                <span v-t>layout.base.info.privacy-policy</span>
                            </Button>
                        </div>
                    </Card>
                </template>
            </Dialog>
        </template>

        <template #secondary>
            <NavigationButton :label="$t('layout.base.settings')"
                              :to="{name: 'UserSettings'}"
                              icon="cog-outline">
            </NavigationButton>
            <NavigationButton :label="$t('layout.base.logout')"
                              data-cy="logout-telephone"
                              icon="logout"
                              tag="li"
                              @click="authenticationStore.logout()"></NavigationButton>
        </template>
    </Navigation>

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
import {$t} from "@/translation/Translation";
import ChangeLanguage from "@/components/ChangeLanguage.vue";
import Navigation from "@/components/design/navigation/Navigation.vue";
import {useRoute} from "vue-router";
import Button from "@/components/design/button/Button.vue";

const data = reactive({
    menu: true
});

const authenticationStore = useAuthenticationStore();

const homepage = import.meta.env.VITE_HOME;
const docs = import.meta.env.VITE_DOCS;
const version = `v${import.meta.env.VITE_APP_VERSION}`;


const route = useRoute();
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
