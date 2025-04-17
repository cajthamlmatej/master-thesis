<template>
    <Header :hasMenu="false">
        <template #navigation>
            <ChangeLanguage :header="false" never-hide />

            <NavigationButton :label="$t('layout.auth.home')" @click="redirect" icon="home-outline"/>
        </template>
    </Header>

    <main class="main--menu">
        <RouterView/>
    </main>
</template>

<script lang="ts" setup>
import {useAuthenticationStore} from "@/stores/authentication";
import {onMounted} from "vue";
import {useRouter} from "vue-router";
import {$t} from "@/translation/Translation";
import ChangeLanguage from "@/components/ChangeLanguage.vue";

const authenticationStore = useAuthenticationStore();
const router = useRouter();


const homepage = import.meta.env.VITE_HOME;

onMounted(() => {
    // If user is logged in, redirect to dashboard
    if (authenticationStore.isLogged) {
        router.push({name: 'Dashboard'});
    }
});

const redirect = () => {
    window.location.href = homepage;
};
</script>
