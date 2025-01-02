<template>
    <RouterView/>

    <Cookies/>

    <Debug />
</template>

<script setup lang="ts">
import Debug from "@/components/Debug.vue";
import Cookies from "@/components/Cookies.vue";
import {useHead} from "unhead";
import {useRouter} from "vue-router";
import {useUserStore} from "@/stores/user";


useHead({
    titleTemplate: (title?: string) => {
        return title ? `${title} — TODO` : 'TODO';
    },
});

const router = useRouter();
const userStore = useUserStore();

router.beforeEach((to, from, next) => {
    if(!to.meta.isAuthentication) {
        userStore.load();
    }

    next();
});
</script>
