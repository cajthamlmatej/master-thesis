<template>
    <RouterView :key="language"/>

    <Cookies :key="language"/>

    <Debug :key="language"/>
</template>

<script lang="ts" setup>
import Debug from "@/components/Debug.vue";
import Cookies from "@/components/Cookies.vue";
import {useHead} from "unhead";
import {useRoute, useRouter} from "vue-router";
import {useUserStore} from "@/stores/user";
import {translation} from "@/translation/Translation";
import {ref, watch} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";
import {communicator} from "@/api/websockets";

useHead({
    htmlAttrs: {
        lang: translation.getLanguage(),
    },
    titleTemplate: (title?: string) => {
        return title ? `${title} — ` + translation.get('web.name') : translation.get('web.name');
    }
});

const router = useRouter();
const userStore = useUserStore();
const authenticationStore = useAuthenticationStore();

router.beforeEach((to, from, next) => {
    if (!to.meta.withoutAuthentication || authenticationStore.isLogged) {
        userStore.load();
    }

    next();
});

const language = ref(translation.getLanguage());

translation.LANGUAGE_CHANGED.on(() => {
    language.value = translation.getLanguage();
});

const route = useRoute();

watch(() => route.params.lang, (lang) => {
    language.value = lang.toString();
});

communicator.initialize();
</script>
