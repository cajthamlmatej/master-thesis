<template>
    <Header :hasMenu="false">
        <template #navigation>
            <!-- Link to mainpage on diff domain -->
            <NavigationButton icon="home-outline" label="Home"/>
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

const authenticationStore = useAuthenticationStore();
const router = useRouter();

onMounted(() => {
    // If user is logged in, redirect to dashboard
    if (authenticationStore.isLogged) {
        router.push({name: 'Dashboard'});
    }
});
</script>
